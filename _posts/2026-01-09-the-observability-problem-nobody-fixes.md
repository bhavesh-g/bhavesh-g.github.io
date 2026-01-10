---
layout: post
title: "the observability problem nobody fixes"
date: 2026-01-09
categories: meta
---

> and why it will cost you months when you finally do

a patient data sync failed silently last week. not a crash. not an error that tripped an alert. the sync just didn't happen. four hours later a clinician pulled a patient's medication history and got stale state. made a decision off that. the whole monitoring stack was green. 45ms latency. database fine. no errors. nothing.

but the thing that actually mattered. the domain event. the state transition that should have cascaded through the system. went completely dark.

we had observability. good observability. we were just observing the wrong layer.

i've watched this happen at three different scales. you ship a service. someone adds logging. someone adds metrics. someone hooks up an analytics event. six months later you have dashboards that tell you your p99 latency and your error rate and your cpu. you can tell your ops team "the system is fine." you cannot tell your cto "is the system actually doing what we built it to do?"

that gap is the entire problem.

## the thing nobody understands about observability

most engineers think observability is a line you move. no logs, then some logs, then comprehensive logs. wrong. it's not a line. it's a dimension. and it has a direction.

on one end: infrastructure observability. memory, cpu, request latency, error rates. useful. prevents pages at 3am for outages. but it answers a simple question: is my infrastructure struggling? that's it. it doesn't tell you why. it doesn't tell you what broke for your users. it tells you your pipes are getting hot.

on the other end: domain observability. in a system processing payments: did the transaction actually settle? did the refund actually reach the customer's account? in a healthcare system: did the prescription actually go to the pharmacy? did the lab result actually reach the ordering doctor? in a messaging system: did the message actually get to the recipient?

this stuff matters because it's what the system exists for. and it requires deliberate instrumentation. it doesn't happen automatically. you have to build it.

most teams live in the mud between these two. they log errors. they count throughput. they track rate limiting. they have no idea whether the actual business logic is working.

the reason: you're instrumenting at the wrong abstraction layer.

## what wrong looks like

take a critical workflow. prescription validation. order comes in. check drug interactions. verify dosage against patient weight and renal function. check allergies. if all checks pass, route to pharmacy. if any fail, flag for manual review.

this is the logic that matters. the code is clean. read it once, you know exactly what's happening.

now someone decides this needs observability. logs hit the function entry. logs on every validation check. logs on success, logs on failure, different log levels, different messages. metrics to count prescriptions by outcome. event tracking for analytics. maybe distributed trace headers.

the business logic is now suffocated. the interaction check is buried under logging code. the dosage verification is tangled with metrics calls. the actual critical path is 20 percent logic, 80 percent instrumentation scaffolding.

someone needs to understand why prescriptions are rejecting. goes to the logs. finds inconsistency. sometimes the drug name is logged. sometimes it's not. sometimes the specific check that failed is there. sometimes it just says "validation failed." depends on which developer wrote that code and when.

so they add more instrumentation. try to get consistent logging. now you have the same check happening in three places, all logging it differently. the core logic gets messier. testing gets harder because you have to mock the logging. changing behavior becomes dangerous because instrumentation is woven through everything.

two years later someone says "we should use a different observability platform." not a small refactor. the instrumentation lives in your business logic. it lives in your data models. it's everywhere. you have to rewrite critical code not because the logic changed, but because you picked a different vendor.

i've seen this cost weeks. weeks of refactoring, code review, testing. touching code you should never have to touch.

## the abstraction problem

you're mixing two concerns at the same layer.

your prescription validation logic cares about drug interactions and dosages. it does not care about log format or metric names or where events get shipped. those are implementation details.

but right now it has to care. the observability concern invaded the domain concern. they're tangled. code is harder to read. harder to test. harder to change.

a developer once spent four hours on a "validation bug" that turned out to be a typo in a log message that got parsed by a downstream system. the bug wasn't in the validation. it was in the observability layer. but they were welded together so you couldn't find it.

solution: separate the concerns completely. your business logic should have zero knowledge of observability. your observability should have zero knowledge of the business logic internals.

when you do this the whole picture changes. the domain code becomes readable again. the observability code becomes maintainable. you can change one without touching the other.

## how it actually works

you have workflows. prescription validation. patient admission. lab result distribution. whatever.

the core logic is pure. input comes in. rules apply. output goes out. no logging. no metrics. no events. just logic.

but the system needs to report observations. prescription validated successfully. prescription rejected due to interaction. prescription flagged for review. these are domain events.

instead of the validation logic calling a logger directly, you introduce an observer. the domain logic doesn't log. it reports observations to the observer.

"i validated a prescription for patient X medication Y and the result was accepted."

or

"i validated a prescription for patient X medication Y and rejected it because of allergy Z."

the observer handles what happens next. logs it. stores it. ships it to another system. emits a metric. doesn't matter to the domain logic.

this is fundamental. now the domain logic can be tested in isolation. now you can change how you capture events without touching the logic that makes decisions. now you can add new requirements without rewriting core code.

more importantly: observers get designed around what actually matters, not around technical constraints.

you ask: what are the business milestones? prescription validated, rejected, flagged for review. design the observer around those. then for each milestone, what context matters? patient, provider, facility, timestamp. build observers that capture that naturally.

observability becomes a design question about what your business needs to understand. not a technical question about where to stick logging calls.

## the context problem nobody solves right

this kills most observability systems: context.

every domain observation needs context. which patient? which provider? which facility? which workflow instance? which user? what's the request id for tracing?

domain logic shouldn't pass all that explicitly. if you make the logic route patient_id, provider_id, facility_id through every function, the code becomes trash. you're mixing business logic with infrastructure noise.

right answer: configure the observer once at the boundary.

request comes in. extract context. patient, provider, facility, workflow, user, request_id. configure the observer with this context. pass the configured observer into the domain logic.

now the logic doesn't think about context. it just works. every observation it makes automatically carries the context because the observer was pre-configured.

this separates people who understand system design from people who just wire up logging.

it's also what makes observability useful. you can now ask: show me all events for patient X. show me all prescriptions ordered by provider Y. show me everything in workflow instance Z. context is baked in because you designed for it.

## what happens when you ignore this

you ship a system with observability scattered through it. works fine. metrics look good. six months later you need to understand a trend. which workflows fail most? which patients hit errors? what's the customer journey when something breaks?

pull the logs. they're inconsistent. some have user_id, some don't. some have workflow_id, some don't. different people logged at different times using different conventions. everything's a mess.

so you add more instrumentation. you want better visibility, so you instrument every decision point. now your domain logic is 80 percent observability, 20 percent domain. and it's all tangled. you can't change the logic without being careful about observability. you can't change observability without risking the logic.

then you decide your observability platform isn't cutting it. time to switch. but your business logic has direct dependencies on the old platform scattered throughout. you can't just swap it. you have to rewrite critical code. suddenly you're touching code you should never touch, taking on risk for a tool migration.

i've seen this take months. because you're not swapping tools. you're refactoring critical logic.

## what actually scales

at every scale, same pattern works:

separate observability as a design layer. the way you separate persistence from business logic. same principle.

create domain observers that speak your domain. domain events, not log lines. domain observations, not metrics emission. the logic says what happened in business terms. the observer translates to infrastructure.

inject context at the boundary. extract it once. configure observers once. pass the configured observer into your logic. the logic never thinks about context.

test them separately. test domain logic in isolation. test that the right observations are emitted with the right data. don't couple tests to log formats or metric names. that's observability layer's job.

treat observability as an architectural decision, not a technical detail. think upfront about what matters. which domain events need visibility? what context is critical? what patterns do you need to see? this has to happen early, not after launch when you're drowning in logs.

the systems that nail this aren't using fancier tools. they're the ones who thought about observability as a design problem. separated concerns early. can change their observability infrastructure without touching domain logic.

## why this matters right now

distributed systems are the default now. microservices. unreliable infrastructure. you can't afford observability that doesn't help you understand what's actually happening. you need visibility into your domain, not just your infrastructure.

if you architected observability from day one, you answer the hard questions. correlate events across services. understand user journeys. catch patterns before they become problems.

if you bolted it on, you're stuck. more logging, more metrics, more alerts. still can't answer basic questions. your codebase gets more complex, not more clear.

good news: not too late. new code can be built right. critical paths can be gradually refactored. what matters is making observability a design decision, not an afterthought.

because next time something breaks, you need to know what happened. in what sequence. with what context. you don't want to spend four hours piecing together logs from eight different systems.

that visibility. the kind that tells you whether your system is actually doing what you built it to do. is worth building into your architecture from day one.

because observability is logic. good observability is clean architecture. bad observability is technical debt that only gets worse.
