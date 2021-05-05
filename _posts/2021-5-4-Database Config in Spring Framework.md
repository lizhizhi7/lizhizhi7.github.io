---
layout:   post
title:    Database Config in Spring Framework
subtitle: Spring框架中的数据库配置
date:     2021-05-04
author:   Oliver Li
catalog:  true
tags:
    - Spring
    - Database
    - Java
---

> There are always plenty frameworks to use in Spring ecosystem. Today I will introduce some SQL components in spring.

## Basic Knowledge

### JDBC
JDBC is the core database API included with Java SE.

### JPA
JPA (Java Persistent API) is just an interface (JSR 220). 

### Spring Data Repositories
> The goal of the Spring Data repository abstraction is to significantly reduce the amount of boilerplate code required to implement data access layers for various persistence stores. -- [Source](https://docs.spring.io/spring-data/jdbc/docs/1.0.10.RELEASE/reference/html/#repositories) 

Spring Data sub-project is a group of repositories to help developer use database fast and safely in Spring ecosystem. So, all the Spring Data repositories have unified API definitions.

We can consider Spring Data as a new ORM-API Spring proposed.

## Frameworks

### MyBatis
MyBatis is one of the most commonly used open-source frameworks for implementing SQL database access in Java applications.

MyBatis does four main things:
1. It executes SQL safely and abstracts away all the intricacies of JDBC
2. It maps parameter objects to JDBC prepared statement parameters
3. It maps rows in JDBC result sets to objects
4. It can generate dynamic SQL with special tags in XML, or through the use of various templating engines

This library takes full advantage of the first three capabilities in MyBatis and essentially becomes another templating engine for generating dynamic SQL.

### Hibernate
Hibernate is one of the implementations of JPA.

### Spring Data JDBC

* Spring Data JDBC is an extended API that wraps the core JDBC API

* Spring Data JDBC is a group of tools to interact with JDBC directly.

### Spring Data JPA

* Spring Data JPA is not a JPA provider, it’s a library which adds extra layer on JPA provider.

* Spring Data JPA is used for enhancing a feature of JPA provided by `javax.persistence` API.

* It comes with predefined API like `Repository`, `CrudOperation`, `JPARepository` and much more.

* Repository layer of our application contains three things: Spring DATA JPA, Spring Data Commons and JPA Provider.
