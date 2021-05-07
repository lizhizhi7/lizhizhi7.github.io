---
layout:     post
title:      MySQL Index
subtitle:   有关 MySQL 索引
date:       2021-04-19
author:     Oliver Li
catalog:    true
tags:
    - MySQL
---

## 索引的建立

基于以下几个原则：
* 表记录比较少时，没必要建立索引。
* 索引的选择性比较低时，没必要建立索引。

## 前缀索引

前缀索引是用列的前缀代替整个列作为索引key，当前缀长度合适时，可以做到既使得前缀索引的选择性接近全列索引，同时因为索引key变短而减少了索引文件的大小和维护开销。
例如：  

```sql
SELECT * FROM employees WHERE first_name='Eric' AND last_name='Anido';
```
执行上面的SQL，时间为0.235s。查看SQL查询计划，可以看出，type为ALL，也就是全表扫描。
```sql
SELECT COUNT(DISTINCT(CONCAT(first_name, last_name)))/COUNT(1) AS Selectivity FROM employees;
```
SQL的结果为0.9313。索引的选择性很好，但是长度为30，有没有兼顾长度和选择性的办法呢？也就是可以考虑用first_name和last_name的前几个字符建立索引，看一下选择性是多少：
```sql
SELECT COUNT(DISTINCT(CONCAT(first_name, LEFT(last_name, 3))))/COUNT(1) AS Selectivity FROM employees;
SELECT COUNT(DISTINCT(CONCAT(first_name, LEFT(last_name, 4))))/COUNT(1) AS Selectivity FROM employees;
```
查询2个SQL的结果分别为0.7879、0.9007，明显第二句SQL的选择性高出很多。我们来建立索引：
```sql
ALTER TABLE employees ADD INDEX `first_name_last_name4` (first_name, last_name(4));
```
查询前面的SQL语句，执行时间为0.002。查询效率已经很明显了。

> 前缀索引兼顾索引大小和查询速度，但是其缺点是不能用于`ORDER BY`和`GROUP BY`操作，也不能用于Covering index（即当索引本身包含查询所有需全部数据时，不再访问数据文件本身）。