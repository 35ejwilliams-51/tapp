# Concept: <NAME>

*Source: MMXM Mentorship Ep.<N> — "<video title>". Standard definition below; correct
anything taught differently.*

## Definition
<One or two sentences: what the concept is, in plain English.>

## Detection rules (codifiable — this becomes the engine logic)
The exact, mechanical conditions on OHLC data that mark this concept as "present":
- Trigger: <e.g. 3-candle sequence where candle1.high < candle3.low>
- Direction: <bullish / bearish / both>
- Anchors: <swing points, session times, prior levels it depends on>
- Invalidation: <when it stops being valid / gets mitigated>
- Timeframe notes: <HTF vs LTF behavior, if any>

## How it draws (overlay spec)
- Shape: <zone rect / line / band / marker>
- Color: <cyan / gold / red / violet / teal …>
- Label: <text shown on chart>
- Extends: <to the right until invalidated? fixed range?>

## Example(s)
- Reference screenshots: `docs/reference/ep<N>/<files>`
- Notes on the marked-up example: <what the instructor highlighted>

## Status
- [ ] Definition captured
- [ ] Visual/overlay spec done
- [ ] Reference screenshots saved
- [ ] Toggle wired in Analyze UI (Phase 2)
- [ ] Auto-detection implemented (Phase 3)
