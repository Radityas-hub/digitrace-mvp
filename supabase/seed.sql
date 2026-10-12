-- DIGITRACE MVP education seed data
-- Run after schema.sql. Existing codes are updated safely.

insert into public.plastic_types (
    code, resin_number, name, short_description, characteristics,
    environmental_impact, recyclable, sorting_steps, examples,
    chart_color, sort_order
)
values
(
    'PET', 1, 'Polyethylene Terephthalate',
    'Plastik bening dan ringan yang umum digunakan untuk botol minuman.',
    'Biasanya bening, kuat, ringan, dan memiliki kode daur ulang 1.',
    'Jika dibuang sembarangan, PET dapat bertahan lama dan pecah menjadi mikroplastik.',
    true,
    '["Kosongkan isi kemasan", "Bilas hingga bersih", "Keringkan dan remas", "Pisahkan tutup bila aturan setempat meminta", "Masukkan ke pengumpulan plastik PET"]'::jsonb,
    array['botol air mineral', 'botol minuman ringan', 'botol minyak goreng'],
    '#2386D8', 1
),
(
    'HDPE', 2, 'High-Density Polyethylene',
    'Plastik kuat dan relatif kaku yang sering dipakai untuk botol kebutuhan rumah tangga.',
    'Cenderung buram, tahan bahan kimia, kaku, dan memiliki kode daur ulang 2.',
    'HDPE dapat mencemari tanah dan perairan jika tidak dikumpulkan, tetapi memiliki nilai daur ulang yang baik.',
    true,
    '["Kosongkan isi", "Bilas sisa cairan", "Keringkan", "Lepaskan komponen berbeda bila mudah", "Kumpulkan bersama plastik HDPE"]'::jsonb,
    array['botol sampo', 'jeriken', 'botol susu buram'],
    '#2EAD67', 2
),
(
    'PVC', 3, 'Polyvinyl Chloride',
    'Plastik yang dapat berbentuk kaku atau lentur dan memerlukan penanganan khusus.',
    'Sering terasa padat atau lentur, digunakan pada pipa dan beberapa kemasan, dengan kode 3.',
    'Pembakaran PVC dapat menghasilkan zat berbahaya. Jangan dibakar dan pisahkan dari plastik umum.',
    false,
    '["Jangan dibakar", "Pisahkan dari plastik lain", "Jaga agar tetap bersih", "Serahkan ke fasilitas yang menerima PVC"]'::jsonb,
    array['pipa PVC', 'selang tertentu', 'kemasan plastik tebal tertentu'],
    '#E94B5F', 3
),
(
    'LDPE', 4, 'Low-Density Polyethylene',
    'Plastik tipis dan lentur yang umum ditemukan pada kantong dan pembungkus.',
    'Lentur, ringan, mudah diremas, dan biasanya memiliki kode daur ulang 4.',
    'Kantong LDPE mudah terbawa angin dan masuk ke saluran air atau laut jika tidak dikelola.',
    true,
    '["Kosongkan dan bersihkan", "Pastikan kering", "Gabungkan kantong sejenis agar tidak tercecer", "Setorkan ke pengumpulan plastik fleksibel"]'::jsonb,
    array['kantong belanja', 'plastik pembungkus', 'kantong roti'],
    '#F2C84B', 4
),
(
    'PP', 5, 'Polypropylene',
    'Plastik tahan panas yang banyak digunakan untuk wadah makanan dan tutup botol.',
    'Agak kaku, ringan, tahan panas, dan memiliki kode daur ulang 5.',
    'PP yang tercampur sisa makanan sulit didaur ulang dan dapat berakhir di tempat pembuangan.',
    true,
    '["Buang sisa makanan", "Cuci hingga tidak berminyak", "Keringkan", "Masukkan ke pengumpulan plastik PP"]'::jsonb,
    array['wadah makanan', 'gelas plastik tertentu', 'tutup botol', 'sedotan'],
    '#8B5CD6', 5
),
(
    'PS', 6, 'Polystyrene',
    'Plastik ringan atau berbusa yang sering digunakan untuk kemasan sekali pakai.',
    'Dapat berbentuk keras atau busa putih, mudah patah menjadi bagian kecil, dan berkode 6.',
    'PS mudah terfragmentasi, sulit dikumpulkan, dan berisiko mencemari lingkungan.',
    false,
    '["Hindari memecah bahan", "Bersihkan sisa makanan", "Pisahkan", "Cari fasilitas khusus yang menerima PS atau styrofoam"]'::jsonb,
    array['styrofoam', 'gelas sekali pakai tertentu', 'sendok plastik tertentu'],
    '#F28C38', 6
),
(
    'OTHER', 7, 'Plastik Lainnya atau Multilayer',
    'Kategori untuk plastik campuran, multilayer, atau bahan yang tidak termasuk kode 1–6.',
    'Bentuk dan sifat beragam; sering berupa kemasan dengan beberapa lapisan material.',
    'Campuran material membuat kategori ini lebih sulit didaur ulang melalui sistem umum.',
    false,
    '["Kosongkan isi", "Bersihkan bila memungkinkan", "Jangan campur dengan plastik yang sudah jelas jenisnya", "Cari program pengumpulan khusus"]'::jsonb,
    array['sachet multilayer', 'kemasan makanan ringan', 'galon polikarbonat tertentu'],
    '#7B8794', 7
)
on conflict (code) do update set
    resin_number = excluded.resin_number,
    name = excluded.name,
    short_description = excluded.short_description,
    characteristics = excluded.characteristics,
    environmental_impact = excluded.environmental_impact,
    recyclable = excluded.recyclable,
    sorting_steps = excluded.sorting_steps,
    examples = excluded.examples,
    chart_color = excluded.chart_color,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

insert into public.products (name, brand, plastic_code, keywords)
select seed.name, seed.brand, seed.plastic_code, seed.keywords
from (
    values
        ('Botol air mineral', null::text, 'PET', array['botol', 'air mineral', 'minuman']),
        ('Botol sampo', null::text, 'HDPE', array['botol', 'sampo', 'sabun']),
        ('Kantong belanja plastik', null::text, 'LDPE', array['kantong', 'kresek', 'tas plastik']),
        ('Wadah makanan plastik', null::text, 'PP', array['wadah', 'makanan', 'kotak']),
        ('Styrofoam makanan', null::text, 'PS', array['styrofoam', 'busa', 'makanan']),
        ('Sachet multilayer', null::text, 'OTHER', array['sachet', 'kemasan', 'multilayer'])
) as seed(name, brand, plastic_code, keywords)
where not exists (
    select 1 from public.products p
    where lower(p.name) = lower(seed.name)
      and p.plastic_code = seed.plastic_code
);

