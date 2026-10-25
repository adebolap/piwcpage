"use client";

export function PrintButton() {
  return (
    <button className="button button-ghost" type="button" onClick={() => window.print()}>
      Print this page
    </button>
  );
}
