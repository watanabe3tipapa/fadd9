/* fadd9 — Landing Page Demos
   LP上の [data-landing-demo] に譜面描画・再生を提供。 */
(() => {
  "use strict";

  if (!window.ABCJS) return;

  const demos = [
    {
      id: "demo-scale",
      abc: 'X:1\nT:C Major Scale\nM:4/4\nL:1/8\nQ:1/4=80\nK:C\nC D E F G A B c | c B A G F E D C |'
    },
    {
      id: "demo-chords",
      abc: 'X:1\nT:Royal Road Progression\nM:4/4\nL:1/4\nQ:1/4=90\nK:C\n"C" C E G c | "G" G B d g | "Am" A c e a | "F" F A c f |'
    },
    {
      id: "demo-riff",
      abc: 'X:1\nT:Blues Shuffle\nM:4/4\nL:1/8\nQ:1/4=120\nK:E\n|: E>E G>E A>E G>E | E>E G>E B>A G>E :|'
    }
  ];

  demos.forEach((d) => {
    const el = document.getElementById(d.id);
    if (!el) return;
    try {
      ABCJS.renderAbc(el, d.abc, {
        responsive: "resize",
        paddingtop: 8,
        paddingbottom: 8,
        paddingleft: 8,
        paddingright: 8,
        scale: 0.85
      });
    } catch {
      el.remove();
    }
  });

  /* 再生ボタン */
  document.querySelectorAll("[data-landing-play]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-landing-play");
      const demo = demos.find((d) => d.id === targetId);
      if (!demo) return;

      if (btn.dataset.playing === "true") {
        if (window.ABCJS.syn) ABCJS.syn.stopAudio();
        btn.textContent = "PLAY";
        btn.dataset.playing = "false";
        return;
      }

      btn.textContent = "STOP";
      btn.dataset.playing = "true";

      try {
        const visualObj = ABCJS.renderAbc("*", demo.abc)[0];
        const synth = new ABCJS.synth.CreateSynth();
        await synth.init({ visualObj });
        await synth.start();
        synth.onEnded(() => {
          btn.textContent = "PLAY";
          btn.dataset.playing = "false";
        });
      } catch {
        btn.textContent = "PLAY";
        btn.dataset.playing = "false";
      }
    });
  });
})();
