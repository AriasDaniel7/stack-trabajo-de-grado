export class NormalizedUtil {
  static normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  static normalizeTilde(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  static normalizeNameWithoutTilde(name: string): string {
    return this.normalizeTilde(this.normalizeName(name));
  }
}
