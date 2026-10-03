/**
 * Rehber ilerlemesi: tutorial ve hero aynı kaydı buradan okur/yazar.
 *
 * Saklanan değer "açık seviye sayısı"dır: 1 = hiç başlanmadı,
 * seviye sayısı + 1 = rehber bitti. Anahtar eski sürümle aynıdır,
 * bu yüzden mevcut kullanıcıların ilerlemesi korunur.
 */

const STORAGE_KEY = "adim-adim-git:ilerleme";

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const progress = {
  /** @param {number} [max] En büyük geçerli değer (seviye sayısı + 1). */
  read(max = Infinity) {
    try {
      const n = parseInt(localStorage.getItem(STORAGE_KEY), 10);
      return Number.isInteger(n) ? clamp(n, 1, max) : 1;
    } catch {
      return 1; // depolama kapalıysa (gizli mod) başlangıç değeri
    }
  },

  /** @param {number} value */
  write(value) {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* depolama kullanılamıyor, ilerleme yalnızca bu oturumda tutulur */
    }
  },

  /** Kullanıcı en az bir seviyeyi bitirdi mi? */
  hasStarted() {
    return this.read() > 1;
  },
};