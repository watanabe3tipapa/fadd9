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
      "X:1\nT:\nM:4/4\nL:1/8\nK:C\n(C D E F) (G A B c) | (c B A G) (F E D C) |",
    rests:
      "X:1\nT:\nM:4/4\nL:1/8\nK:C\nC z C z | C2 z2 C z z z |",
    ties:
      "X:1\nT:\nM:4/4\nL:1/4\nK:C\nC- C C- C | D- D D- D |",
    decorations:
      "X:1\nT:\nM:4/4\nL:1/4\nK:C\n!trill! C D E F | !turn! G A B c | !fermata! c4 |",
    lyrics:
      "X:1\nT:Example with Lyrics\nM:4/4\nL:1/8\nK:C\nw: Do Re Mi Fa Sol La Ti Do\nC D E F G A B c |",
    voices:
      "X:1\nT:Two Voices\nM:4/4\nL:1/8\nK:C\nV:1 clef=treble\nV:2 clef=bass\nV:1\nC E G c | G E C G |\nV:2\nC,, E,, G,, C, | G,, E,, C,, G,, |",
    dynamics:
      "X:1\nT:\nM:4/4\nL:1/4\nK:C\n!pp! C D E F | !mf! G A B c | !ff! c B A G |",
    capo:
      "X:1\nT:Capo 2nd Fret\nM:4/4\nL:1/4\nK:G\n%%MIDI program 25\n\"G\" G B d g | \"C\" c e g c' | \"D\" d ^f a d' |",
    strum:
      "X:1\nT:Strumming Pattern\nM:4/4\nL:1/8\nK:C\n\"C\" C2 E2 G2 c2 | \"G\" G2 B2 d2 g2 |"
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
