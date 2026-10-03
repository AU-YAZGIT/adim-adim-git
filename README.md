# Adım Adım Git

**Ankara Üniversitesi Yapay Zeka ve Görüntü İşleme Topluluğu (AÜ-YAZGIT)** tarafından hazırlanan, Git ve GitHub'ı hiç kullanmamış herkes için ücretsiz, Türkçe ve etkileşimli bir başlangıç rehberi.

**Rehbere git:** https://au-yazgit.github.io/adim-adim-git/

---

## Bu rehber nedir?

Bu rehber, kurulum gerektirmeden tarayıcıda açılan bir eğitim sayfasıdır. Sol tarafta adımların listesi bulunur. **"Anladım, devam et"** butonuna bastıkça bir sonraki adım açılır ve sayfa sen öğrendikçe büyür. Adımların sonunda, öğrendiklerini pekiştirmen için kısa sorular vardır.

Rehberin sonunda topluluğumuzun giriş deposu olan [uni_101](https://github.com/AU-YAZGIT/uni_101) deposuna gerçek bir ilk katkı yapmış olursun.

## Neler öğreneceksin?

### Bölüm 1: Temeller
1. Git nedir, GitHub nedir, neden ayrı?
2. Git nasıl çalışır? (hızlı bakış)
3. `.git` klasörü nedir?
4. Kurulum ve kullanım (terminal + VS Code)
5. Üç temel komut: `add`, `commit`, `push`
6. Neden her yere push edemezsin?

### Bölüm 2: Açık kaynağa katkı
7. Fork nedir, clone'dan farkı ne?
8. Katkı verilecek proje nasıl bulunur? (`good first issue` arama dahil)
9. Issues sekmesi ve katkı etiği
10. Pull request ve `Closes #1`

### Bölüm 3: Kurtarma araçları
11. `git log`, `git stash`, `git revert`
12. Merge conflict (kısaca)

### Final
13. [uni_101](https://github.com/AU-YAZGIT/uni_101) deposuna ilk katkın

## Kimler için?

- Git ve GitHub'ı hiç kullanmamış öğrenciler
- Yarışma ve proje takımlarına katılmadan önce temel bilgi edinmek isteyenler
- Açık kaynağa katkı vermek isteyip nereden başlayacağını bilmeyenler

Ön bilgi gerekmez.

## Teknik bilgiler

Proje tamamen statiktir: HTML, CSS ve JavaScript'ten oluşur. Sunucu, veritabanı veya hesap gerektirmez. İlerlemen tarayıcında saklanır, sayfayı kapatıp geri döndüğünde kaldığın yerden devam edersin.

### Bilgisayarında çalıştırmak

```bash
git clone https://github.com/AU-YAZGIT/adim-adim-git.git
cd adim-adim-git
python -m http.server 8000
```

Sonra tarayıcıda `http://localhost:8000` adresini aç. `index.html` dosyasını doğrudan açmak da çoğu zaman yeterlidir.

### Yayınlama

Proje GitHub Pages ile yayınlanır: Settings > Pages > Deploy from a branch > main > / (root). Değişiklikler `main` branch'e birleştirildiğinde site otomatik güncellenir.

## Hata bildirimi ve öneri

Bir yazım hatası, yanlış bilgi ya da eksik gördüğünde Issues sekmesinden yeni bir issue açabilirsin. Rehberin kendisi de Git ve GitHub öğrenmek için güzel bir ilk katkı alanıdır.

## Emeği geçenler

Bu rehber, topluluğumuzun öğrencileri tarafından hazırlanmıştır.

| Rol | Kişi |
|---|---|
| Proje yöneticisi | Ad Soyad |
| İçerik | Ad Soyad |
| Tasarım | Ad Soyad, Ad Soyad |
| Geliştirme | Ad Soyad |

## Lisans

[MIT](LICENSE)

## Topluluğumuz

**Ankara Üniversitesi Yapay Zeka ve Görüntü İşleme Topluluğu (AÜ-YAZGIT)**

[Web Sitesi](https://www.yazgit.com.tr/) · [LinkedIn](https://tr.linkedin.com/company/au-yazgit) · [Instagram](https://www.instagram.com/au_yazgit/) · [GitHub](https://github.com/AU-YAZGIT)