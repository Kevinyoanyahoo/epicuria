const choices = [
  ['face', 'Visage', ['Naturel', 'Alternative', 'Affirmé', 'Taches de rousseur']],
  ['shirt', 'Haut indépendant', ['Chemise', 'Col roulé', 'Polo', 'Blouse', 'Wax chic']],
  ['jacket', 'Veste indépendante', ['Sans veste', 'Blazer', 'Costume', 'Gilet', 'Trench']],
  ['trousers', 'Couleur du pantalon', ['Marine', 'Brun', 'Sable', 'Anthracite']],
  ['shoes', 'Chaussures', ['Cuir noir', 'Cuir cognac', 'Cuir clair', 'Bordeaux']],
  ['glasses', 'Lunettes indépendantes', ['Sans', 'Avec lunettes']],
  ['jewel', 'Bijou indépendant', ['Aucun', 'Boucles', 'Collier', 'Montre']]
];
export default function AppearanceControls() {
  const originalLook = sanLook;
  sanLook = l => {
    const result = originalLook(l), limits = { face: 4, shirt: 5, jacket: 5, trousers: 4, shoes: 4, glasses: 2, jewel: 4, shirtColor: OUTFITS.length, jacketColor: OUTFITS.length };
    Object.entries(limits).forEach(([key, limit]) => { if (Number.isInteger(l?.[key]) && l[key] >= 0 && l[key] < limit) result[key] = l[key]; }); return result;
  };
  const anchor = document.getElementById('segAcc')?.closest('.row'); if (!anchor) return;
  const holder = document.createElement('div'); holder.id = 'pixelAppearance'; anchor.after(holder);
  const bind = () => {
    holder.replaceChildren();
    choices.forEach(([key, label, labels]) => {
      const row = document.createElement('div'); row.className = 'row';
      const title = document.createElement('label'); title.textContent = label;
      const buttons = document.createElement('div'); buttons.className = 'seg';
      labels.forEach((text, value) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
        button.classList.toggle('on', S.look[key] === value);
        button.onclick = () => { S.look[key] = value; [...buttons.children].forEach(b => b.classList.toggle('on', b === button)); refreshPrev(); };
        buttons.append(button);
      });
      row.append(title, buttons); holder.append(row);
    });
    [['shirtColor', 'Couleur du haut'], ['jacketColor', 'Couleur de veste']].forEach(([key, label]) => {
      const row = document.createElement('div'); row.className = 'row';
      const title = document.createElement('label'); title.textContent = label;
      const buttons = document.createElement('div'); buttons.className = 'sw';
      OUTFITS.forEach((color, value) => { if (value === 8 && !S.own.gold) return;
        const button = document.createElement('button'); button.type = 'button'; button.style.background = color;
        button.title = `${label} ${value + 1}`; button.classList.toggle('on', S.look[key] === value);
        button.onclick = () => { S.look[key] = value; [...buttons.children].forEach(b => b.classList.toggle('on', b === button)); refreshPrev(); }; buttons.append(button);
      }); row.append(title, buttons); holder.append(row);
    });
  };
  const original = fillCreate; fillCreate = (...args) => {
    original(...args); bind();
    document.querySelectorAll('#segG button, #segGarm button').forEach(button => {
      const handler = button.onclick; button.onclick = event => { delete S.look.shirt; delete S.look.jacket; handler(event); bind(); };
    });
  }; fillCreate();
}