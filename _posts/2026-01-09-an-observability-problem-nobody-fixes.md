---
layout: post
title: "an observability problem nobody fixes"
date: 2026-01-09
categories: meta
---

> and why it will cost you months when you finally do

a patient sync failed silently four hours ago. not a crash. the logs were fine. the api was responding in 45ms. the database was healthy. everything looked green on the dashboards.

but four hours later a clinician pulled up a patient's medication history and got stale data. made a clinical decision on that. the sync had never happened. the system had no way to tell us.

this is the thing i keep running into. infrastructure observability and domain observability are not the same thing. i spent years thinking they were. they're not.

## i used to think observability was just logging

early in my career i assumed that if you logged errors and tracked request latency and monitored cpu, you had observability. that was the setup i inherited at my first real job. dashboards everywhere. alerts for everything. we knew when the system was struggling.

we had no idea what the system was actually doing.

i remember needing to understand why prescriptions were being rejected at high rates. went to the logs. found a hundred different rejection messages, all logged differently, some with patient data, some without, some with the drug name, some just saying "validation failed." nobody had coordinated on how to log this. each developer who touched the code added their own approach.

so i started adding more logging. got more consistent. then someone needed to understand if certain drug interactions were being caught. so i added events. then analytics wanted to track something. so we added event tracking. after a few years the prescription validation code had logging calls and metrics emission and analytics event firing woven through the entire path.

the code worked. but reading it felt like reading a debugging session. it was hard to understand what the actual validation logic was doing because everything was buried under observability calls.

## the moment this became a real problem

we decided to migrate to a different observability platform. this should have been a tool swap. it turned into a nightmare.

the observability calls were so embedded in the business logic that we couldn't just swap the client library. we had to touch the prescription validation code. we had to test it carefully. we had to coordinate across teams. it took weeks.

i remember thinking: i'm rewriting critical code to change a logging tool. how is this my problem?

that's when i realized the issue wasn't the logging. it was where the logging lived.

## what i started seeing in other systems

after that project i noticed the same pattern everywhere i looked. teams would build a feature, add observability to it, and six months later the business logic and the observability logic were so tangled that you couldn't change one without being careful about the other.

sometimes it was because someone needed to add a new field to an event and it required understanding how the business logic worked. sometimes it was because the observability wasn't giving you the context you needed, so people started adding more and more parameters to functions, just to pass context through.

i watched teams decide they needed better visibility into their systems, so they added more instrumentation. the code got more complex. testing got harder. but the visibility didn't improve. they still couldn't answer the question they cared about.

## the pattern i started recognizing

what became clear was that infrastructure observability and business observability are operating at different layers.

infrastructure observability tells you if your system is struggling. cpu is high. memory is climbing. requests are slow. outages.

business observability tells you if your system is working. did the prescription get to the pharmacy? did the lab result reach the ordering provider? did the payment actually complete?

most teams build infrastructure observability well. they get alerts for cpu, memory, errors. but business observability requires thinking about what actually matters in your domain. and that has to be deliberate.

i noticed that the teams doing this well weren't building infrastructure observability differently. they were separating it from the business logic. they created a layer whose job was to translate domain events into whatever observability platform they were using.

## how this actually looks

the pattern i started seeing was simple. the core business logic reported what happened in domain terms. a prescription was validated. a prescription was rejected due to interaction. a prescription was flagged for manual review.

instead of having the validation code call logging functions and metrics clients and analytics libraries, it reported these observations to a separate object whose sole job was to handle observability.

that observer could log it. could emit it to metrics. could send it to analytics. could store it in a database. the business logic didn't care. it just reported what happened.

the observer could also handle context. when a request came in, we extracted all the metadata we needed. patient id, provider, facility, request id for tracing. we configured the observer with that context once. the business logic never had to think about context. every observation it made automatically carried all the necessary metadata.

this separation meant that the business logic stayed clean. it was just validation logic. pure. testable in isolation. readable.

it also meant that if we wanted to change how we observed things, we changed the observer, not the business logic.

## the part that surprised me

i expected this to require more code. it doesn't. it requires less code in the places that matter.

the prescription validation code is smaller. easier to read. easier to test. the observability logic lives somewhere else and is focused on one job: translating domain events into infrastructure events.

the bigger surprise was how much better the observability actually was. because now all the observations were being made from the same place, with the same context, following the same patterns. when i needed to understand which prescriptions were failing, the data was consistent. no more digging through logs that were all formatted differently.

## context is the part that kills most attempts

i've watched teams try this approach and fail because they didn't handle context well. they ended up passing patient_id and provider_id and facility_id through every function signature. the code became messier, not cleaner.

the systems that got this right configured the observer once at the boundary. when the request came in, you extracted context. you created an observer pre-configured with that context. you passed that into the business logic. now the logic never had to think about context.

it sounds simple. it changes everything.

## the cost of not doing this

i've seen the alternative. i've lived it. you build a system with observability scattered through it. it works. you add more observability because you need better visibility. the code gets more complex. the problem you're trying to solve doesn't actually get solved because the observability is at the wrong layer.

then someone wants to migrate to a different platform. or wants to change how you're logging. or wants to add a new field to an event. and suddenly you're touching critical code. taking on risk. spending weeks refactoring something you shouldn't have to refactor.

i've measured this cost. it's weeks. sometimes months. i've watched engineers spend more time refactoring observability code than they spent building the original feature.

## what actually matters

what i keep coming back to is that observability is an architectural decision, not a tool decision.

you can pick the best logging library and still get observability wrong if it's mixed into your business logic. you can pick the worst metrics client and get observability right if you've separated the concerns.

the systems i've seen age well are the ones where someone early on decided: observability is a design layer. the way we separate persistence from business logic, we separate observability from business logic.

that decision ripples through everything. how you test code. how you reason about code. how you change code. whether you can migrate platforms without rewriting critical logic.

## why i'm writing this

i keep seeing teams solve the wrong problem. they get better monitoring tools. better dashboards. more logging. and still can't answer the basic questions about their system.

i also keep seeing teams pay months of engineering time to refactor observability that should never have been embedded in the business logic in the first place.

it's not about picking the right tool. it's about where the logic lives.

the next time you're adding observability to a critical path, ask: is this business logic or is this observability logic? if they're mixed, separate them. not later. now.

because that separation is what lets you change your system later. that separation is what makes your observability actually useful. and that separation is what keeps you from paying months to fix something that should have been designed right the first time.
