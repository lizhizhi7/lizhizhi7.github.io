---
layout:     post
title:      MATLAB Optimization
subtitle:   Matlab 优化算法及工具箱使用
date:       2020-2-11
author:     Oliver Li
header-img: img/background-matlab.jpg
catalog: true
tags:
    - Matlab
---

## Global Optimization

### Optimization Workflow

1. Decide what type of problem you have, and whether you want a local or global solution. Choose a solver per the recommendations in Table for Choosing a Solver (Below).

2. Write your objective function and, if applicable, constraint functions per the syntax in [Compute Objective Functions](https://www.mathworks.com/help/gads/computing-objective-functions.html) and [Write Constraints](https://www.mathworks.com/help/gads/constraints.html).

3. Set appropriate options using [optimoptions](https://www.mathworks.com/help/optim/ug/optim.problemdef.optimizationproblem.optimoptions.html), or prepare a GlobalSearch or MultiStart problem as described in [Workflow for GlobalSearch and MultiStart](https://www.mathworks.com/help/gads/outline-of-steps.html). For details, see [Pattern Search Options](https://www.mathworks.com/help/gads/pattern-search-options.html), [Particle Swarm Options](https://www.mathworks.com/help/gads/particle-swarm-options.html), [Genetic Algorithm Options](https://www.mathworks.com/help/gads/genetic-algorithm-options.html), [Simulated Annealing Options](https://www.mathworks.com/help/gads/simulated-annealing-options.html), or [Surrogate Optimization Options](https://www.mathworks.com/help/gads/surrogate-optimization-options.html).

4. Run the solver.

5. Examine the result. For information on the result, see [Solver Outputs and Iterative Display](https://www.mathworks.com/help/optim/solver-outputs-and-iterative-display.html) (Optimization Toolbox) or [Examine Results](https://www.mathworks.com/help/gads/global-or-multiple-starting-point-search.html) for GlobalSearch or MultiStart.

> If the result is unsatisfactory, change options or start points or otherwise update your optimization and rerun it. For information, see [Global Optimization Toolbox Solver Characteristics](https://www.mathworks.com/help/gads/improving-optimization-by-choosing-another-solver.html) or [Improve Results](https://www.mathworks.com/help/gads/global-or-multiple-starting-point-search.html). For information on improving solutions that applies mainly to smooth problems, see [When the Solver Fails](https://www.mathworks.com/help/optim/ug/when-the-solver-fails.html) (Optimization Toolbox), [When the Solver Might Have Succeeded](https://www.mathworks.com/help/optim/ug/when-the-solver-might-have-succeeded.html) (Optimization Toolbox), or [When the Solver Succeeds](https://www.mathworks.com/help/optim/ug/when-the-solver-succeeds.html) (Optimization Toolbox).

### Global Optimization Toolbox solvers

Global Optimization Toolbox provides functions that search for global solutions to problems that contain **multiple maxima or minima**. Toolbox solvers include *surrogate, pattern search, genetic algorithm, particle swarm, simulated annealing, multistart, and global search*.  

You can use these solvers for optimization problems where the objective or constraint function is *continuous, discontinuous, stochastic, does not possess derivatives, or includes simulations or black-box functions*.  

For problems with multiple objectives, you can identify a Pareto front using genetic algorithm or pattern search solvers.

You can improve solver effectiveness by adjusting options and, for applicable solvers, customizing creation, update, and search functions. You can use custom data types with the genetic algorithm and simulated annealing solvers to represent problems not easily expressed with standard data types. The hybrid function option lets you improve a solution by applying a second solver after the first.

* **GlobalSearch and MultiStart** generate a number of starting points. They then use a local solver to find the optima in the basins of attraction of the starting points.

* **ga** uses a set of starting points (called the population) and iteratively generates better points from the population. As long as the initial population covers several basins, ga can examine several basins.

* **particleswarm**, like ga, uses a set of starting points. particleswarm can examine several basins at once because of its diverse population.

* **simulannealbnd** performs a random search. Generally, simulannealbnd accepts a point if it is better than the previous point. simulannealbnd occasionally accepts a worse point, in order to reach a different basin.

* **patternsearch** looks at a number of neighboring points before accepting one of them. If some neighboring points belong to different basins, patternsearch in essence looks in a number of basins at once.

* **surrogateopt** begins by quasirandom sampling within bounds, looking for a small objective function value. surrogateopt uses a merit function that, in part, gives preference to points that are far from evaluated points, which is an attempt to reach a global solution. After it cannot improve the current point, surrogateopt resets, causing it to sample widely within bounds again. Resetting is another way surrogateopt searches for a global solution.

### Choose a solver

|Problem Type|Recommended Solver|
|:-:|:-:|
|Smooth (objective twice differentiable), and you want a local solution|An appropriate Optimization Toolbox™ solver; see [Optimization Decision Table](https://www.mathworks.com/help/optim/ug/optimization-decision-table.html) (Optimization Toolbox)
|Smooth (objective twice differentiable), and you want a global solution or multiple local solutions|[GlobalSearch](https://www.mathworks.com/help/gads/globalsearch.html) or [MultiStart](https://www.mathworks.com/help/gads/multistart.html)|
Nonsmooth, and you want a local solution|[patternsearch](https://www.mathworks.com/help/gads/patternsearch.html)|
|Nonsmooth, and you want a global solution or multiple local solutions|[surrogateopt](https://www.mathworks.com/help/gads/surrogateopt.html) or [patternsearch](https://www.mathworks.com/help/gads/patternsearch.html) with several initial points x0|

**Functions**

|||
|:-:|:-:|
|ga|Find minimum of function using genetic algorithm|
|gamultiobj|Find Pareto front of multiple fitness functions using genetic algorithm|
|paretosearch|Find points in Pareto set|
|particleswarm|Particle swarm optimization|
|patternsearch|Find minimum of function using pattern search|
|simulannealbnd|Find minimum of function using simulated annealing algorithm|
|surrogateopt|Surrogate optimization for global minimization of time-consuming objective functions|

**Objects**

|||
|:-:|:-:|
|GlobalSearch|Find global minimum|
|MultiStart|Find multiple local minima|

[Optimization Decision Table](https://www.mathworks.com/help/optim/ug/optimization-decision-table.html)

#### Genetic Algorithm

Genetic algorithm solver for mixed-integer or continuous-variable optimization, constrained or unconstrained
Genetic algorithm solves smooth or nonsmooth optimization problems with any types of constraints, including integer constraints. It is a stochastic, population-based algorithm that searches randomly by mutation and crossover among population members.

[More About GA](https://www.mathworks.com/help/gads/genetic-algorithm.html)

[GA Options](https://www.mathworks.com/help/gads/examples/genetic-algorithm-options.html)

#### Particle Swarm

Particle swarm solver for derivative-free unconstrained optimization or optimization with bounds
Particle swarm solves bound-constrained problems with an objective function that can be nonsmooth. Try this if patternsearch does not work satisfactorily.

[More About PSO](https://www.mathworks.com/help/gads/particle-swarm.html)

#### Global or Multiple Starting Point Search

Multiple starting point solvers for gradient-based optimization, constrained or unconstrained

These solvers apply to problems with smooth objective functions and constraints. They run Optimization Toolbox™ solvers repeatedly to try to locate a global solution or multiple local solutions.

[More About GSPS/MSPS](https://www.mathworks.com/help/gads/global-or-multiple-starting-point-search.html)

#### Refs

* [Comparison of Six Solvers](https://www.mathworks.com/help/gads/example-comparing-several-solvers.html)  
* [Can You Certify That a Solution Is Global?](https://www.mathworks.com/help/gads/can-you-certify-a-solution-is-global.html)  
* [Solver Behavior with a Nonsmooth Problem](https://www.mathworks.com/help/gads/global-solver-choices.html)  
* [Global Optimization Toolbox Solver Characteristics](https://www.mathworks.com/help/gads/improving-optimization-by-choosing-another-solver.html#bsa_e88)
