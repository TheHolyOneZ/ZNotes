export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "var(--bg-deep)" }}>

      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(6,182,212,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(16,185,129,0.04) 0%, transparent 60%)" }}
      />


      <div className="animate-orb-1 absolute"
        style={{ width: 700, height: 700, top: "-15%", left: "-10%",
          background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)",
          borderRadius: "50%", filter: "blur(40px)" }}
      />


      <div className="animate-orb-2 absolute"
        style={{ width: 600, height: 600, bottom: "-20%", right: "-10%",
          background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)",
          borderRadius: "50%", filter: "blur(40px)" }}
      />


      <div className="animate-orb-3 absolute"
        style={{ width: 400, height: 400, top: "40%", left: "35%",
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)",
          borderRadius: "50%", filter: "blur(60px)" }}
      />


      <div className="absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat", backgroundSize: "200px" }}
      />
    </div>
  );
}
