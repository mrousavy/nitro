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

## First paired CI result

[Run 33898772711](https://github.com/margelo/nitro/actions/runs/33898772711)
built both revisions independently and completed six base/head suites per
platform, including the one permitted noise retry. Both sides used Release
Nitro, Hermes, and the same benchmark-suite hash.

- Android C++ `addNumbers`: 173.6 ns/op → 621.4 ns/op (+258%, 95% CI
  +247%…+261%). The JS control changed -0.6%; the TurboModule control remained
  inconclusive.
- iOS C++ `addNumbers`: 161.5 ns/op → 450.5 ns/op (+179%, 95% CI
  +154%…+211%). The first reporter called every synchronous iOS case noisy
  because its robust CV exceeded 5%, even when the paired interval was
  decisive.

That result exposed a reporting-policy bug rather than a sampling failure. The
infrastructure PR now lets a change whose full paired confidence interval is
beyond the budget keep its regression/improvement verdict. CV still produces a
neutral result when the interval cannot decide. Rebuilding the report from the
same raw samples yields 29 Android and 25 iOS regressions while leaving the JS
and TurboModule controls neutral.
