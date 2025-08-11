---
layout: post
title: "Insecure Deserialization – Java"
date: 2025-07-01
categories: [java, insecure-deserialization, security]
tags: [java, serialization, deserialization, security, rce]
thumbnail-img: /assets/img/JAVA/XXD.png
subtitle: "A basic demonstration of how Java's Serializable mechanism works"
description: "A basic demonstration of how Java's Serializable mechanism works, and how insecure deserialization can lead to vulnerabilities like remote code execution."
tags: [JAVA, Application-Security, Web-Vulnerabilities]
---

Java's built-in `Serializable` mechanism allows objects to be converted into a byte stream and stored or transmitted.  
However, **if untrusted data is deserialized without validation, it can lead to remote code execution (RCE)** or other serious issues.

---

## Serialization Example
~~~java
import java.io.*;
import java.util.Date;

public class Serialization {
    public static void main(String[] args) throws Exception {
        Person p = new Person();
        p.name = "Ben";
        p.birthDate = new Date(0x1337);
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("./person.bin"));
        oos.writeObject(p);
        oos.flush();
    }
}

class Person implements Serializable {
    public static final long serialVersionUID = 0x12345678L;
    public String name;
    public Date birthDate;
}
~~~

<p align="center">
  <img src="..\assets\img\JAVA\XXD.png" alt="xxd output" width="600"/><br/>
  <em>Figure 1 – Hexadecimal output of the serialized Java object (`xxd person.bin`)</em>
</p>

---

## Deserialization Example
~~~java
import java.io.*;

public class Deserialization {
    public static void main(String[] args) throws Exception {
        ObjectInputStream ois = new ObjectInputStream(
                new FileInputStream("./person.bin")
        );

        Person p = (Person) ois.readObject();

        System.out.println("Name:\t\t" + p.name +
                "\nBirthDate:\t" + p.birthDate.getTime());
    }
}
~~~

**Sample Output:**

<img width="417" height="112" alt="image" src="..\assets\img\JAVA\IDE.png" />

---

## What Can Go Wrong?

- `ObjectInputStream` does **not** verify which class gets deserialized.
- No built-in whitelist/blacklist of allowed classes.
- Any serializable class accessible to the current classloader can be loaded.
- Even if a `ClassCastException` occurs later, the object is still created.
- User-supplied input can trigger code inside `readObject()` or `readResolve()`.
- If a class executes dangerous actions in these methods, it can be abused.

**Example Case Study:**  
Apache Commons FileUpload – CVE-2013-2186.

---

## References

- [Devoxx Talk – Java Serialization](https://www.youtube.com/watch?v=WWsN9Y5OtZQ&ab_channel=Devoxx)  
- [John Hammond – Java Deserialization](https://www.youtube.com/watch?v=S103iW01dxQ&ab_channel=JohnHammond)  
- [Marcus Niemietz (HackPra) – Java Deserialization Exploitation](https://www.youtube.com/watch?v=VviY3O-euVQ&ab_channel=MarcusNiemietz%28HackPra%29)
