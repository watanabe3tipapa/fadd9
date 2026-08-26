/* FADD9 — Reference
   チートシート上の [data-demo] に、鳴る実例スコアを描画する。 */
(() => {
  "use strict";

  const DEMOS = {
    octaves:
      "X:1\nT:\nM:4/4\nL:1/8\nK:C\nC D E F G A B c | c B A G F E D C |",
    accidentals:
      "X:1\nT:\nM:3/4\nL:1/4\nK:C\n^F _B =F | ^F2 _B2 |",
    durations:
      "X:1\nT:\nM:4/4\nL:1/4\nK:C\nC2 D E F | C3 D z2 |",
    broken:
      "X:1\nT:\nM:4/4\nL:1/8\nK:C\n|: C>C C>C C>C C>C :|",
    repeats:
      "X:1\nT:\nM:4/4\nL:1/4\nK:C\n|: C D E F | G A B c :|",
    dyad:
      "X:1\nT:\nM:4/4\nL:1/8\nK:E\n|: [EG] z [EG] z [EG] [EA] [EG] z :|",
    chordsym:
      "X:1\nT:\nM:4/4\nL:1/4\nK:C\n\"C\" C E G c | \"G\" G B d g | \"Am\" A c e a |",
    powerchord:
      "X:1\nT:\nM:4/4\nL:1/8\nK:E\n|: [EG] z [EG] z [EG] [EA] [EG] z :|",
    arpeggio:
      "X:1\nT:\nM:4/4\nL:1/8\nK:C\n\"C\" C E G c E G c | \"Am\" A c e a c e a c |",
    slur:
      "X:1\nT:\nM:4/4\nL:1/8\nK:C\n(C D E F) (G A B c) | (c B A G) (F E D C) |"
  };

  document.querySelectorAll("[data-demo]").forEach((el) => {
    const abc = DEMOS[el.dataset.demo];
    if (!abc || !window.ABCJS) return;
    try {
      window.ABCJS.renderAbc(el, abc, {
        responsive: "resize",
        paddingtop: 10,
        paddingbottom: 10,
        paddingleft: 12,
        paddingright: 12,
        scale: 0.9
      });
    } catch {
      el.remove();
    }
  });
})();
