import { Fragment } from "react";

export default function CinemaProjector() {
  return (
    <div className="camera-wrap" aria-hidden="true">
      <div className="beam" />
      <div className="filmstrip">
        <div className="strip-track">
          {[0, 1].map((k) => (
            <div
              key={k}
              style={{ display: "flex", height: "100%", flexShrink: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <Fragment key={i}>
                  <div className="strip-hole-row">
                    <div className="strip-hole" />
                    <div className="strip-hole" />
                  </div>
                  <div className="strip-frame" />
                </Fragment>
              ))}
              <div className="strip-hole-row">
                <div className="strip-hole" />
                <div className="strip-hole" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="cam-body">
        <div className="cam-lens-ring">
          <div className="cam-lens-inner">
            <div className="cam-lens-core" />
          </div>
        </div>
        <div className="cam-reel cam-reel--big" />
        <div className="cam-reel cam-reel--sml" />
        <div className="cam-handle" />
      </div>
      <div className="tripod">
        <div className="tripod-center" />
      </div>
    </div>
  );
}
