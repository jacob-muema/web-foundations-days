# Day 8 Reflection

## What Was the Most Difficult Concept, and How Did I Overcome It?

The most challenging concept throughout this course was **concurrency control** — specifically,
understanding how two users can race to buy the same seat and why application-level checks alone
are not enough to stop them. At first it seemed like a simple "if/else" problem: check whether
the seat is free, then mark it taken. But the more I read about transactions and time-of-check /
time-of-use (TOCTOU) races, the clearer it became that two threads can both pass the "is it
free?" check before either writes the answer back, leaving both believing they won.

I overcame this by working through the `SELECT FOR UPDATE` examples step by step, drawing out
two concurrent timelines on paper and tracing exactly where the lock blocks one transaction
until the other commits. Seeing the database as a traffic officer — one car through the
intersection at a time — made the abstract idea concrete. Layering Redis `SET NX` on top then
made sense as an early filter that spares the database from even seeing most of the collisions.

## Which Part of My Capstone Would I Improve?

Based on the feedback I received, I would invest more time in the **load-estimation section**.
My current estimates are reasonable but somewhat hand-wavy about the peak-hour multiplier and
session length assumptions. A stronger version would anchor every number to a real-world
benchmark — for example, citing how Ticketmaster reports handling Taylor Swift presale traffic —
and would include a capacity-planning table showing exactly how many API servers and database
connections are needed at each RPS level. More precision there would make the architecture
decisions feel inevitable rather than arbitrary.

## What Will I Learn Next?

I plan to dive into **distributed systems fundamentals** — specifically consistency models
(linearisability vs. eventual consistency), the CAP theorem in practice, and how systems like
Apache Kafka handle ordered event streaming. I also want to build a small project using a
message queue so I can feel the trade-offs between synchronous and asynchronous processing
rather than just reason about them on paper.
