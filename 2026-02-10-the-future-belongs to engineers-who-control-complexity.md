---
layout: post
title: "the future belongs to engineers who control complexity"
date: 2025-10-25
categories: meta
---

> ai did not change engineering. it removed the excuses.

i have written systems where a small mistake took hours to trace.

i have also shipped work where most of the code was generated and reviewed only at the boundaries.

output increased, hence the need for judgment increased faster.

that is the shift.

---

## typing was never the constraint

there is a lot of noise about ai writing code.

writing code was never the hard part.

the hard parts are:

- making unclear requirements precise  
- choosing tradeoffs when every option has cost  
- understanding system behavior under failure  
- knowing the impact of a small change  
- keeping complexity under control  

example.

a product asks for "real time notifications".

implementation is easy. websockets. pubsub.

the real questions are:

how many connections per user  
what happens when the service restarts  
do we guarantee delivery  
how do we prevent duplicate events  
what is the acceptable delay  

ai can write the socket handler.

it cannot define the system contract.

in most production environments, engineers already spend more time thinking, aligning, and debugging than typing.

ai accelerates implementation.

engineering is not implementation.

---

## what ai actually gives you

in real usage, the value is straightforward:

- fast generation of standard patterns  
- removal of repetitive work  
- quick exploration of alternatives  
- assistance with local reasoning  

this removes a large amount of mechanical effort.

boilerplate  
crud layers  
test scaffolding  
migrations  
basic integrations  

example.

you need an internal admin panel for managing users.

routes  
forms  
validation  
api wiring  

ai can generate the whole thing in minutes.

but then requirements change.

bulk operations  
audit logs  
role based access  
export for compliance  

the first version was easy.

the system is where the work begins.

when the cost of building drops, the amount of software requested increases.

every productivity jump in this industry has done the same thing.

capacity expands. demand expands faster.

---

## where the failure shows up

ai produces the statistically likely solution.

systems fail because of the unlikely conditions.

this mismatch appears quickly.

**structure degrades**

without strict direction, generated code accumulates:
- duplication  
- inconsistent abstractions  
- unclear ownership  

example.

three features are added over a month.

each generated separately.

now there are three ways to access the same data.

no single owner.

small changes require touching multiple paths.

complexity grows faster because generation is cheap.

**defects move to the edges**

the common paths work.

edge cases fail.

example.

a payment service works in testing.

in production:

timeout after charge  
retry triggers duplicate payment  
user is charged twice  

the code was correct locally.

the system behavior was wrong.

someone still needs a correct mental model.

**no long term intent**

when something breaks, the model optimizes for the local fix.

example.

a test fails due to timing.

the generated fix increases timeout.

tests pass.

latency doubles in production.

local success. system regression.

---

## the real bottleneck now

strong engineers are not limited by typing speed.

they are limited by decision quality.

they carry working models of:

dependencies  
failure modes  
data movement  
operational constraints  
business impact  

example.

a feature requires joining data from two services.

quick solution: synchronous call.

correct solution: async pipeline.

the difference shows up under load.

ai can write either.

it cannot choose based on future traffic patterns.

when code generation becomes cheap, judgment becomes the scarce resource.

---

## the new gap

there used to be developers who assembled features without understanding the system.

now there will be developers who generate entire systems without understanding them.

they move fast.

until something non obvious fails.

example.

a search feature is generated using full table scans.

works with 10k records.

fails at 10 million.

fixing it later requires redesign, reindexing, and downtime.

speed becomes baseline.

understanding becomes differentiator.

---

## demand will increase, not decrease

faster development does not reduce software needs.

it changes expectations.

when building becomes cheap:

one system becomes many variants  
defaults become customization  
team tools become individual tools  

example.

earlier one dashboard served the whole company.

now every team wants:

custom metrics  
custom alerts  
custom workflows  

each version is small.

operational surface area grows quickly.

generated systems still require:

ownership  
monitoring  
integration  
security  
cost management  
continuous change  

building software is the cheapest phase.

operating software is where the cost lives.

---

## where senior engineers create leverage

the value is moving away from implementation.

the leverage is in:

defining system boundaries  
maintaining architectural consistency  
setting constraints for generated code  
reviewing for long term impact  
diagnosing failures under uncertainty  
aligning technical decisions with business risk  

example.

without guardrails, teams generate services directly hitting the database.

short term speed.

long term coupling.

schema change becomes a company wide incident.

senior impact has never been about writing more code.

it has always been about preventing expensive mistakes.

more code generation means more opportunities for expensive mistakes.

---

## what this means for engineers

if your value is based on:

syntax knowledge  
framework familiarity  
writing standard features  

you are competing with automation.

if your value is based on:

system design  
tradeoff decisions  
debugging under ambiguity  
long term ownership  

your leverage increases.

the role is shifting.

less time producing code.

more time controlling what enters the system.

---

## the constraint that does not change

ai will improve.

larger context  
better reasoning  
faster generation  

but one constraint remains.

when production breaks, someone is accountable.

example.

cpu spikes  
latency increases  
revenue drops  

the question is never:

> who wrote the code

the question is:

> who understands the system

accountability requires understanding and tools do not carry responsibility.

engineers do.

---

ai is not removing engineers.

it is removing the `value of low judgment work`.

when anyone can generate code, the industry stops rewarding people who produce code.

it rewards people who keep systems stable under change.

read that again.

the future belongs to engineers who control complexity.
