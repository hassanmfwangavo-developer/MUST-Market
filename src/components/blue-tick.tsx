/** Instagram-style verified badge shown inline with a product title. */
export function BlueTick({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Verified"
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
    >
      <title>Verified by MUST Market</title>
      <path
        fill="#0095F6"
        d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z"
      />
      <path
        fill="#fff"
        d="m17.4 27.1-6.2-6.2 2.4-2.4 3.8 3.8 9.1-9.1 2.4 2.4-11.5 11.5Z"
      />
    </svg>
  );
}
