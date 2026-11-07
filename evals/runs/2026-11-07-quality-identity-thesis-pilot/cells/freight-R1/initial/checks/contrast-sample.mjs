// Manual contrast sampling for pairs axe left "incomplete" because a card
// background is a CSS gradient. Sample the darkest and lightest gradient stops.
function hex(h) {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function lum(rgb) {
  const a = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function ratio(fg, bg) {
  const L1 = lum(hex(fg)), L2 = lum(hex(bg));
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

const pairs = [
  ['--text #eef5fa on card stop #162c41', '#eef5fa', '#162c41', 4.5],
  ['--text #eef5fa on card stop #122437', '#eef5fa', '#122437', 4.5],
  ['--muted #a9bfd0 on card stop #122437', '#a9bfd0', '#122437', 4.5],
  ['--dim #8ea8bc on card stop #122437 (secondary, 12-14px -> large-ish)', '#8ea8bc', '#122437', 4.5],
  ['--dim #8ea8bc on card stop #162c41', '#8ea8bc', '#162c41', 4.5],
  ['--warn #ffc76f on warn surface #2b2a26 approx', '#ffc76f', '#2b2a26', 4.5],
  ['--ok #77e3b4 on ok surface approx #1b3a38', '#77e3b4', '#1b3a38', 4.5],
  ['--ice #7ee7f5 on page bg #0a1520', '#7ee7f5', '#0a1520', 4.5],
  ['--ice #7ee7f5 on panel #122437 (kicker)', '#7ee7f5', '#122437', 4.5],
  ['btn primary ink #062330 on #7ee7f5', '#062330', '#7ee7f5', 4.5],
  ['--text #eef5fa on page bg #0a1520', '#eef5fa', '#0a1520', 4.5],
  ['--dim #8ea8bc on page bg #0a1520', '#8ea8bc', '#0a1520', 4.5],
  ['--muted #a9bfd0 on page bg #0a1520', '#a9bfd0', '#0a1520', 4.5],
  ['placeholder #7e97ab on input #061218', '#7e97ab', '#061218', 4.5],
  ['--warn #ffc76f on page bg #0a1520 (sim flag)', '#ffc76f', '#0a1520', 4.5],
];

let fails = 0;
const rows = [];
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fails++;
  rows.push({ label, fg, bg, ratio: r, min, pass: ok });
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + r + ':1  ' + label);
}
console.log('\nfailures:', fails);
process.exit(fails ? 1 : 0);
