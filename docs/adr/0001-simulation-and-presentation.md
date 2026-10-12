# A deterministic simulation separated from Canvas
Use a fixed 60 Hz domain simulation and a Canvas renderer with accessible HTML commands, rather than coupling game state to frame rate or adopting an external engine. This makes combat and save rules testable independently and keeps the original small adventure portable. The cost is maintaining bespoke drawing, input and collision code.
