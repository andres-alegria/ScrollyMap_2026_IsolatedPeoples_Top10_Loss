import React from "react";
import "./PlainImage.css";

export default function PlainImage(props) {
  const { src, alt = "", height = "100vh", fit = "cover", position = "center", caption } = props || {};
  if (!src) return null;

  return (
    <section className="panel plain-image">
      <div className="plain-image__wrap" style={{ height }}>
        <img
          className="plain-image__img"
          src={src}
          alt={alt}
          style={{ objectFit: fit, objectPosition: position }}
        />
      </div>
      {caption && (
        <p className="plain-image__caption" dangerouslySetInnerHTML={{ __html: caption }} />
      )}
    </section>
  );
}
