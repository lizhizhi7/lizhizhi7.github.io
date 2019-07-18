---
layout:     post
title:      Spring&Thymeleaf
subtitle:   Spring Template
date:       2019-3-2
author:     Oliver
header-img: img/background-spring.jpg
catalog: true
tags:
    - Spring
    - Spring Boot
    - Thymeleaf
---

## Examples

```xml
<form action="#" th:action="@{/greeting}" th:object="${greeting}" method="post">
    <p>Id: <input type="text" th:field="*{id}" /></p>
    <p>Message: <input type="text" th:field="*{content}" /></p>
    <p><input type="submit" value="Submit" /> <input type="reset" value="Reset" /></p>
</form>
```
