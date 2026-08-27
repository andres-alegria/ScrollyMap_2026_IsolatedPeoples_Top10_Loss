import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Flip from "gsap/Flip";

import "./GalleryFilter.css";

gsap.registerPlugin(ScrollTrigger, Flip);

// Generic, network-free demo data (no real photography needed to demo this
// stage — swap `filters`/`items` for real categories/images in config.js).
// Colors are the "mid" tone from three families in Mongabay's secondary
// (editorial/topic) palette — see the mongabay-brand skill for the full set.
const DEFAULT_FILTERS = [
  { id: "CategoryA", label: "Category A" },
  { id: "CategoryB", label: "Category B" },
  { id: "CategoryC", label: "Category C" },
];
const DEFAULT_ITEMS = [
  { id: "item-1", category: "CategoryA", color: "#74ADB3" }, // Blue mid
  { id: "item-2", category: "CategoryA", color: "#123940" }, // Blue dark
  { id: "item-3", category: "CategoryB", color: "#C9D04D" }, // Green mid
  { id: "item-4", category: "CategoryB", color: "#384E21" }, // Green dark
  { id: "item-5", category: "CategoryC", color: "#E8A643" }, // Orange mid
  { id: "item-6", category: "CategoryC", color: "#4C2F1F" }, // Orange dark
];

export default function GalleryFilter({ filters, items, heading }) {
  const rootRef = useRef(null);
  const filterDefs = Array.isArray(filters) && filters.length ? filters : DEFAULT_FILTERS;
  const itemDefs = Array.isArray(items) && items.length ? items : DEFAULT_ITEMS;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cleanups = []; // <- store listener removals etc.

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      // Filter gallery (Flip)
      const allCheckbox = q("#all")[0];
      const filterEls = gsap.utils.toArray(q(".filter"));
      const itemEls = gsap.utils.toArray(q(".item"));

      if (allCheckbox && filterEls.length && itemEls.length) {
        const updateFilters = () => {
          const state = Flip.getState(itemEls);

          const classes = filterEls
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => "." + checkbox.id);

          const matches = classes.length ? gsap.utils.toArray(q(classes.join(","))) : [];

          itemEls.forEach((item) => {
            item.style.display = matches.includes(item) ? "inline-flex" : "none";
          });

          Flip.from(state, {
            duration: 0.7,
            scale: true,
            ease: "power1.inOut",
            stagger: 0.08,
            onEnter: (els) =>
              gsap.fromTo(els, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.6 }),
            onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0, duration: 0.6 }),
          });

          allCheckbox.checked = matches.length === itemEls.length;
        };

        const onFilterClick = () => updateFilters();
        filterEls.forEach((cb) => cb.addEventListener("click", onFilterClick));
        cleanups.push(() => filterEls.forEach((cb) => cb.removeEventListener("click", onFilterClick)));

        const onAllClick = () => {
          filterEls.forEach((cb) => (cb.checked = allCheckbox.checked));
          updateFilters();
        };
        allCheckbox.addEventListener("click", onAllClick);
        cleanups.push(() => allCheckbox.removeEventListener("click", onAllClick));

        updateFilters();
      }

      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [filterDefs, itemDefs]);

  return (
    <div className="stage-combo" ref={rootRef}>
      {heading && (
        <section className="panel plain">
          <h1>{heading}</h1>
        </section>
      )}

      <section className="container">
        <div className="buttons-container">
          <div className="checkboxes">
            <label className="tag-button" htmlFor="all">
              <input type="checkbox" id="all" defaultChecked />
              All
              <span className="checked">All</span>
            </label>

            {filterDefs.map((f) => (
              <label className="tag-button" htmlFor={f.id} key={f.id}>
                <input type="checkbox" id={f.id} className="filter" defaultChecked />
                {f.label}
                <span className="checked">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="box-container">
          {itemDefs.map((item) => (
            <div
              key={item.id}
              className={`item ${item.category}`}
              style={
                item.src
                  ? { backgroundImage: `url('${item.src}')` }
                  : { background: item.color || "#092F29" }
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
