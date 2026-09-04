# Performance regression canary — DO NOT MERGE

This draft PR intentionally adds 128 rounds of dependent unsigned arithmetic to
each HybridFunction native-state lookup. Volatile local storage keeps the work
in optimized Release builds without shared state, sleeps, allocations, or altered
return values. Closing this PR discards the entire experiment.

The base is the top of the infrastructure stack, including the version-alignment
PR. Both base and head already contain the same benchmark app and definitions.
CI must build both binaries independently and run the existing ABBA sequence.
The suite hash must remain identical; this is not a rebaseline or an A/A run.

Expected observations:

- C++ and Swift/Kotlin primitive calls and property access get slower.
- JS and TurboModule controls do not execute this extra work.
- Expensive operations can show a much smaller relative change.
- Promise metrics remain advisory. Performance verdicts overall remain advisory;
  a detected regression does not imply that the build check should turn red.

End-to-end validation checks the real GitHub Actions artifacts, confirms base
and head SHAs and matching suite hashes, inspects the paired PR comment, and
verifies Bencher reports for both platform testbeds and this PR branch. Bencher
publishing requires the rotated project key in `BENCHER_KEY` and
`NITRO_BENCHER_ENABLED=true`; the paired PR comment is independent of that key.

Reporting fixes belong in the infrastructure PR, not in this canary diff. Keep
this PR draft and never merge its intentional production slowdown.
