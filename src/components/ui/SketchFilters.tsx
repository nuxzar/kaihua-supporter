/** Global SVG filters — identical to world.ss0202.com / ssworld */
export function SketchFilters() {
  return (
    <svg
      aria-hidden
      width={0}
      height={0}
      className="absolute"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        <filter id="sketch-rough" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves={3}
            seed={4}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={2.4}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="sketch-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={1.8}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="pencil-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={2}
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0.15
                    0 0 0 0 0.15
                    0 0 0 0 0.15
                    0 0 0 0.08 0"
            result="mono"
          />
          <feBlend in="SourceGraphic" in2="mono" mode="multiply" />
        </filter>
      </defs>
    </svg>
  );
}
