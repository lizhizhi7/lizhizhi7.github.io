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

> There are always plenty frameworks to use in spring ecosystem. Today I will introduce some SQL components in spring.

## Basic Knowledge

### JDBC
JDBC is the core database API included with Java SE.

### JPA
JPA (Java Persistent API) is just an interface. 

### Spring Data Repositories
> The goal of the Spring Data repository abstraction is to significantly reduce the amount of boilerplate code required to implement data access layers for various persistence stores. -- [Source](https://docs.spring.io/spring-data/jdbc/docs/1.0.10.RELEASE/reference/html/#repositories) 

Spring Data sub-project is a group of repositories to help developer use database fast and safely in Spring ecosystem. So, all the Spring Data repositories have unified API definitions.

We can consider Spring Data as a new ORM-API Spring proposed.

## Frameworks

## MyBatis

## Hibernate
Hibernate is one of the implementations of JPA.

## Spring Data JDBC

Spring JDBC is an extended API the wraps the core JDBC API.

## Spring Data JPA
