import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 بدء زرع البيانات التجريبية...\n");

  // ══════════════════════════════════════
  // 1. إعدادات المنصة
  // ══════════════════════════════════════
  console.log("⚙️  إنشاء إعدادات المنصة...");
  await prisma.settings.upsert({
    where: { key: "SERVICE_FEE" },
    update: { value: "50" },
    create: { key: "SERVICE_FEE", value: "50" },
  });
  await prisma.settings.upsert({
    where: { key: "PLATFORM_NAME" },
    update: { value: "منصة الخدمات" },
    create: { key: "PLATFORM_NAME", value: "منصة الخدمات" },
  });
  console.log("   ✅ تم إنشاء الإعدادات\n");

  // ══════════════════════════════════════
  // 2. التصنيفات (6 تصنيفات)
  // ══════════════════════════════════════
  console.log("📂 إنشاء التصنيفات...");
  const categoriesData = [
    { name: "استشارات وقضايا",   slug: "consultations", icon: "⚖️",  color: "#6366F1", order: 1 },
    { name: "عقارات وأملاك",     slug: "real-estate",   icon: "🏢",  color: "#0EA5E9", order: 2 },
    { name: "سفر وترفيه",        slug: "travel",        icon: "✈️",  color: "#F59E0B", order: 3 },
    { name: "ولائم وضيافة",      slug: "catering",      icon: "🍽️",  color: "#EF4444", order: 4 },
    { name: "عناية ورفاهية",     slug: "wellness",      icon: "✨",  color: "#EC4899", order: 5 },
    { name: "التدريب والتعليم",  slug: "education",     icon: "🎓",  color: "#10B981", order: 6 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const c = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = c.id;
    console.log(`   ✅ ${cat.name}`);
  }
  console.log("");

  // ══════════════════════════════════════
  // 3. المناطق والمدن
  // ══════════════════════════════════════
  console.log("🗺️  إنشاء المناطق والمدن...");
  const regionsData = [
    {
      name: "الرياض", slug: "riyadh", order: 1,
      cities: [
        { name: "الرياض",      slug: "riyadh-city" },
        { name: "الخرج",       slug: "al-kharj" },
        { name: "المزاحمية",   slug: "al-muzahimiyah" },
        { name: "الدرعية",     slug: "diriyah" },
      ],
    },
    {
      name: "القصيم", slug: "qassim", order: 2,
      cities: [
        { name: "بريدة",       slug: "buraidah" },
        { name: "عنيزة",       slug: "unaizah" },
        { name: "الرس",        slug: "al-rass" },
        { name: "البكيرية",    slug: "al-bukayriyah" },
      ],
    },
    {
      name: "المنطقة الشرقية", slug: "eastern", order: 3,
      cities: [
        { name: "الدمام",      slug: "dammam" },
        { name: "الخبر",       slug: "al-khobar" },
        { name: "الأحساء",     slug: "al-ahsa" },
        { name: "القطيف",      slug: "qatif" },
      ],
    },
    {
      name: "جدة", slug: "jeddah", order: 4,
      cities: [
        { name: "جدة",         slug: "jeddah-city" },
        { name: "رابغ",        slug: "rabigh" },
        { name: "الليث",       slug: "al-lith" },
        { name: "القنفذة",     slug: "al-qunfudhah" },
      ],
    },
    {
      name: "أبها", slug: "abha", order: 5,
      cities: [
        { name: "أبها",        slug: "abha-city" },
        { name: "خميس مشيط",  slug: "khamis-mushait" },
        { name: "النماص",      slug: "al-namas" },
        { name: "بيشة",        slug: "bisha" },
      ],
    },
  ];

  const regions: Record<string, string> = {};
  const cities: Record<string, string> = {};

  for (const regionData of regionsData) {
    const { cities: citiesData, ...regionInfo } = regionData;
    const region = await prisma.region.upsert({
      where: { slug: regionInfo.slug },
      update: {},
      create: regionInfo,
    });
    regions[regionInfo.slug] = region.id;
    console.log(`   ✅ منطقة: ${regionInfo.name}`);

    for (const cityData of citiesData) {
      const city = await prisma.city.upsert({
        where: { slug: cityData.slug },
        update: {},
        create: { ...cityData, regionId: region.id },
      });
      cities[cityData.slug] = city.id;
    }
  }
  console.log("");

  // ══════════════════════════════════════
  // 4. المستخدمون التجريبيون (12 مستخدم)
  // ══════════════════════════════════════
  console.log("👥 إنشاء المستخدمين...");

  const admin = await prisma.user.upsert({
    where: { phone: "0500000000" },
    update: {},
    create: {
      name: "مدير المنصة",
      username: "admin",
      phone: "0500000000",
      email: "admin@khadamat.sa",
      role: "ADMIN",
      isVerified: true,
      city: "الرياض",
      bio: "مدير منصة الخدمات السعودية",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=1E3A5F",
    },
  });

  const users = await Promise.all([
    prisma.user.upsert({
      where: { phone: "0501111111" },
      update: {},
      create: {
        name: "أحمد العمري",
        username: "ahmed_omari",
        phone: "0501111111",
        email: "ahmed@example.com",
        role: "USER",
        isVerified: true,
        city: "الرياض",
        bio: "محامٍ متخصص في القضايا التجارية مع خبرة 10 سنوات",
        rating: 4.8,
        totalRatings: 24,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ahmed&backgroundColor=6366F1",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0502222222" },
      update: {},
      create: {
        name: "سارة الزهراني",
        username: "sara_zahrani",
        phone: "0502222222",
        email: "sara@example.com",
        role: "USER",
        isVerified: true,
        city: "جدة",
        bio: "مستشارة عقارية معتمدة - متخصصة في عقارات جدة",
        rating: 4.6,
        totalRatings: 18,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=sara&backgroundColor=EC4899",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0503333333" },
      update: {},
      create: {
        name: "محمد القحطاني",
        username: "mohammed_qahtani",
        phone: "0503333333",
        email: "mohammed@example.com",
        role: "USER",
        isVerified: true,
        city: "الدمام",
        bio: "منظم رحلات ومرشد سياحي معتمد",
        rating: 4.9,
        totalRatings: 35,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=mohammed&backgroundColor=F59E0B",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0504444444" },
      update: {},
      create: {
        name: "نورة السعدي",
        username: "noura_saadi",
        phone: "0504444444",
        email: "noura@example.com",
        role: "USER",
        isVerified: true,
        city: "الرياض",
        bio: "متخصصة في تنظيم الولائم والمناسبات الفاخرة",
        rating: 4.7,
        totalRatings: 42,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=noura&backgroundColor=EF4444",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0505555555" },
      update: {},
      create: {
        name: "خالد الشمري",
        username: "khalid_shamri",
        phone: "0505555555",
        email: "khalid@example.com",
        role: "USER",
        isVerified: true,
        city: "بريدة",
        bio: "مدرب لياقة بدنية معتمد دولياً - 8 سنوات خبرة",
        rating: 4.5,
        totalRatings: 29,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=khalid&backgroundColor=10B981",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0506666666" },
      update: {},
      create: {
        name: "فاطمة الحربي",
        username: "fatima_harbi",
        phone: "0506666666",
        email: "fatima@example.com",
        role: "USER",
        isVerified: true,
        city: "أبها",
        bio: "مدرّسة لغة إنجليزية وتأسيس - خبرة 12 عاماً",
        rating: 4.9,
        totalRatings: 51,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=fatima&backgroundColor=0EA5E9",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0507777777" },
      update: {},
      create: {
        name: "عبدالله المطيري",
        username: "abdullah_mutairi",
        phone: "0507777777",
        role: "USER",
        isVerified: true,
        city: "الخبر",
        rating: 0,
        totalRatings: 0,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=abdullah&backgroundColor=6366F1",
      },
    }),
    // 5 مستخدمين إضافيين
    prisma.user.upsert({
      where: { phone: "0508888888" },
      update: {},
      create: {
        name: "منى الغامدي",
        username: "mona_ghamdi",
        phone: "0508888888",
        role: "USER",
        isVerified: true,
        city: "جدة",
        rating: 0,
        totalRatings: 0,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=mona&backgroundColor=EC4899",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0509999999" },
      update: {},
      create: {
        name: "يوسف الدوسري",
        username: "yousuf_dosari",
        phone: "0509999999",
        role: "USER",
        isVerified: true,
        city: "الدمام",
        rating: 4.3,
        totalRatings: 12,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=yousuf&backgroundColor=F59E0B",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0511111111" },
      update: {},
      create: {
        name: "ريم العتيبي",
        username: "reem_otaibi",
        phone: "0511111111",
        role: "USER",
        isVerified: true,
        city: "الرياض",
        rating: 4.6,
        totalRatings: 8,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=reem&backgroundColor=10B981",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0512222222" },
      update: {},
      create: {
        name: "سلمان البقمي",
        username: "salman_buqami",
        phone: "0512222222",
        role: "USER",
        isVerified: true,
        city: "أبها",
        rating: 4.8,
        totalRatings: 15,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=salman&backgroundColor=6366F1",
      },
    }),
    prisma.user.upsert({
      where: { phone: "0513333333" },
      update: {},
      create: {
        name: "هنوف الرشيدي",
        username: "hanouf_rashidi",
        phone: "0513333333",
        role: "USER",
        isVerified: true,
        city: "بريدة",
        rating: 4.4,
        totalRatings: 9,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=hanouf&backgroundColor=EF4444",
      },
    }),
  ]);

  const [u1, u2, u3, u4, u5, u6, u7, u8] = users;
  console.log(`   ✅ تم إنشاء ${users.length + 1} مستخدم (بما فيهم المدير)\n`);

  // ══════════════════════════════════════
  // 5. الخدمات التجريبية (40 خدمة)
  // ══════════════════════════════════════
  console.log("🛠️  إنشاء الخدمات التجريبية...");

  const servicesData = [
    // === استشارات وقضايا (7 خدمات) ===
    {
      title: "استشارة قانونية في العقود التجارية",
      description: "أقدم لك استشارة قانونية متكاملة في مجال العقود التجارية وحماية حقوقك القانونية. خبرة 10 سنوات في المحاكم السعودية. الاستشارة تشمل مراجعة العقد، تحديد نقاط الضعف، وتقديم التوصيات اللازمة.",
      tags: JSON.stringify(["قانون", "عقود", "استشارة"]),
      deliveryTime: "خلال 24 ساعة",
      categorySlug: "consultations", providerId: u1.id,
      regionSlug: "riyadh", citySlug: "riyadh-city",
      images: [
        { url: "https://picsum.photos/seed/law1/800/600",    publicId: "law1",    width: 800, height: 600, sizeKb: 320, order: 0 },
        { url: "https://picsum.photos/seed/law2/800/600",    publicId: "law2",    width: 800, height: 600, sizeKb: 290, order: 1 },
        { url: "https://picsum.photos/seed/law3/800/600",    publicId: "law3",    width: 800, height: 600, sizeKb: 310, order: 2 },
      ],
      views: 245,
    },
    {
      title: "متابعة قضايا العمالة والتأشيرات",
      description: "متخصص في قضايا العمالة، نزاعات العمل، وإجراءات التأشيرات. سأساعدك في متابعة قضيتك وتقديم الاستشارات اللازمة لإنهائها بأسرع وقت.",
      tags: JSON.stringify(["عمالة", "تأشيرات", "قضايا"]),
      deliveryTime: "حسب القضية",
      categorySlug: "consultations", providerId: u1.id,
      regionSlug: "riyadh", citySlug: "al-kharj",
      images: [
        { url: "https://picsum.photos/seed/work1/800/600",   publicId: "work1",   width: 800, height: 600, sizeKb: 280, order: 0 },
        { url: "https://picsum.photos/seed/work2/800/600",   publicId: "work2",   width: 800, height: 600, sizeKb: 265, order: 1 },
      ],
      views: 189,
    },
    {
      title: "استشارة مالية وإدارة الاستثمارات",
      description: "استشارة مالية شاملة لمساعدتك في اتخاذ القرارات الاستثمارية الصحيحة. نحلل وضعك المالي ونضع خطة مدروسة لتنمية ثروتك وتحقيق أهدافك.",
      tags: JSON.stringify(["مالية", "استثمار", "تخطيط"]),
      deliveryTime: "جلسة ساعتين",
      categorySlug: "consultations", providerId: u2.id,
      regionSlug: "jeddah", citySlug: "jeddah-city",
      images: [
        { url: "https://picsum.photos/seed/finance1/800/600", publicId: "fin1", width: 800, height: 600, sizeKb: 295, order: 0 },
        { url: "https://picsum.photos/seed/finance2/800/600", publicId: "fin2", width: 800, height: 600, sizeKb: 270, order: 1 },
        { url: "https://picsum.photos/seed/finance3/800/600", publicId: "fin3", width: 800, height: 600, sizeKb: 285, order: 2 },
      ],
      views: 312,
    },
    {
      title: "توثيق عقود البيع والشراء",
      description: "خدمة توثيق وصياغة عقود البيع والشراء بصورة قانونية سليمة تضمن حقوق جميع الأطراف. نصيغ العقد بدقة ونراجعه مع الطرفين قبل التوقيع.",
      tags: JSON.stringify(["توثيق", "عقود", "بيع"]),
      deliveryTime: "نفس اليوم",
      categorySlug: "consultations", providerId: u1.id,
      regionSlug: "eastern", citySlug: "dammam",
      images: [
        { url: "https://picsum.photos/seed/contract1/800/600", publicId: "con1", width: 800, height: 600, sizeKb: 300, order: 0 },
      ],
      views: 156,
    },
    // 3 خدمات استشارات إضافية
    {
      title: "استشارة ضريبية وزكاة الأعمال",
      description: "استشارة ضريبية متخصصة لأصحاب الأعمال والشركات في المملكة العربية السعودية. تشمل احتساب الزكاة، ضريبة القيمة المضافة، وضريبة الدخل للشركات الأجنبية. نضمن الامتثال الكامل لأنظمة الهيئة الزكاة.",
      tags: JSON.stringify(["ضرائب", "زكاة", "أعمال"]),
      deliveryTime: "خلال 48 ساعة",
      categorySlug: "consultations", providerId: u1.id,
      regionSlug: "riyadh", citySlug: "riyadh-city",
      images: [
        { url: "https://picsum.photos/seed/tax1/800/600", publicId: "tax1", width: 800, height: 600, sizeKb: 310, order: 0 },
        { url: "https://picsum.photos/seed/tax2/800/600", publicId: "tax2", width: 800, height: 600, sizeKb: 288, order: 1 },
      ],
      views: 198,
    },
    {
      title: "تأسيس شركات ومؤسسات فردية",
      description: "خدمة متكاملة لتأسيس الشركات والمؤسسات الفردية في المملكة. نتولى الإجراءات القانونية كاملة: وزارة التجارة، الغرفة التجارية، والسجل التجاري. توفير الوقت والجهد بخبرة 8 سنوات.",
      tags: JSON.stringify(["تأسيس", "شركات", "تجارة"]),
      deliveryTime: "7-14 يوم عمل",
      categorySlug: "consultations", providerId: u1.id,
      regionSlug: "eastern", citySlug: "dammam",
      images: [
        { url: "https://picsum.photos/seed/company1/800/600", publicId: "comp1", width: 800, height: 600, sizeKb: 295, order: 0 },
        { url: "https://picsum.photos/seed/company2/800/600", publicId: "comp2", width: 800, height: 600, sizeKb: 278, order: 1 },
        { url: "https://picsum.photos/seed/company3/800/600", publicId: "comp3", width: 800, height: 600, sizeKb: 302, order: 2 },
      ],
      views: 256,
    },
    {
      title: "متابعة قضايا التحكيم التجاري",
      description: "تمثيل قانوني احترافي في جلسات التحكيم التجاري وفق أنظمة التحكيم السعودية والدولية. نحمي حقوقك ونسعى للحصول على أفضل نتيجة في أقل وقت ممكن.",
      tags: JSON.stringify(["تحكيم", "تجاري", "قضايا"]),
      deliveryTime: "حسب القضية",
      categorySlug: "consultations", providerId: u2.id,
      regionSlug: "jeddah", citySlug: "jeddah-city",
      images: [
        { url: "https://picsum.photos/seed/arbitration1/800/600", publicId: "arb1", width: 800, height: 600, sizeKb: 290, order: 0 },
        { url: "https://picsum.photos/seed/arbitration2/800/600", publicId: "arb2", width: 800, height: 600, sizeKb: 265, order: 1 },
      ],
      views: 143,
    },

    // === عقارات وأملاك (6 خدمات) ===
    {
      title: "تقييم عقاري معتمد للعقارات السكنية",
      description: "تقديم تقرير تقييم عقاري معتمد من مقيّم معتمد لدى الهيئة السعودية للمقيّمين المعتمدين. يشمل التقرير تحليل السوق، المساحة، الموقع، والقيمة السوقية العادلة.",
      tags: JSON.stringify(["تقييم", "عقار", "مساكن"]),
      deliveryTime: "3-5 أيام",
      categorySlug: "real-estate", providerId: u2.id,
      regionSlug: "jeddah", citySlug: "jeddah-city",
      images: [
        { url: "https://picsum.photos/seed/realestate1/800/600", publicId: "re1", width: 800, height: 600, sizeKb: 340, order: 0 },
        { url: "https://picsum.photos/seed/realestate2/800/600", publicId: "re2", width: 800, height: 600, sizeKb: 320, order: 1 },
        { url: "https://picsum.photos/seed/realestate3/800/600", publicId: "re3", width: 800, height: 600, sizeKb: 305, order: 2 },
      ],
      views: 420,
    },
    {
      title: "البحث عن شقة مناسبة وتفاوض الإيجار",
      description: "أبحث لك عن الشقة المناسبة حسب متطلباتك وميزانيتك في جميع أحياء جدة، وأتفاوض بالنيابة عنك للحصول على أفضل سعر وشروط إيجار.",
      tags: JSON.stringify(["إيجار", "شقق", "تفاوض"]),
      deliveryTime: "أسبوع واحد",
      categorySlug: "real-estate", providerId: u2.id,
      regionSlug: "jeddah", citySlug: "rabigh",
      images: [
        { url: "https://picsum.photos/seed/apt1/800/600", publicId: "apt1", width: 800, height: 600, sizeKb: 315, order: 0 },
        { url: "https://picsum.photos/seed/apt2/800/600", publicId: "apt2", width: 800, height: 600, sizeKb: 298, order: 1 },
      ],
      views: 287,
    },
    {
      title: "إدارة العقارات المؤجرة",
      description: "خدمة إدارة متكاملة للعقارات المؤجرة تشمل: تحصيل الإيجار، الصيانة الدورية، التعامل مع المستأجرين، وتقديم تقارير شهرية لمالك العقار.",
      tags: JSON.stringify(["إدارة", "عقار", "مستأجرين"]),
      deliveryTime: "خدمة شهرية",
      categorySlug: "real-estate", providerId: u2.id,
      regionSlug: "riyadh", citySlug: "riyadh-city",
      images: [
        { url: "https://picsum.photos/seed/property1/800/600", publicId: "prop1", width: 800, height: 600, sizeKb: 325, order: 0 },
        { url: "https://picsum.photos/seed/property2/800/600", publicId: "prop2", width: 800, height: 600, sizeKb: 310, order: 1 },
        { url: "https://picsum.photos/seed/property3/800/600", publicId: "prop3", width: 800, height: 600, sizeKb: 290, order: 2 },
      ],
      views: 198,
    },
    // 3 خدمات عقارات إضافية
    {
      title: "تصوير عقاري احترافي للبيع والإيجار",
      description: "تصوير احترافي للعقارات السكنية والتجارية بكاميرات عالية الدقة. يشمل تصوير خارجي وداخلي، تعديل الصور، وإنتاج جولة افتراضية 360 درجة لاستقطاب أكبر عدد من المشترين.",
      tags: JSON.stringify(["تصوير", "عقار", "احترافي"]),
      deliveryTime: "يومان بعد الجلسة",
      categorySlug: "real-estate", providerId: u2.id,
      regionSlug: "riyadh", citySlug: "riyadh-city",
      images: [
        { url: "https://picsum.photos/seed/photore1/800/600", publicId: "phre1", width: 800, height: 600, sizeKb: 390, order: 0 },
        { url: "https://picsum.photos/seed/photore2/800/600", publicId: "phre2", width: 800, height: 600, sizeKb: 370, order: 1 },
        { url: "https://picsum.photos/seed/photore3/800/600", publicId: "phre3", width: 800, height: 600, sizeKb: 360, order: 2 },
      ],
      views: 312,
    },
    {
      title: "تأجير استوديوهات وشقق مؤثثة",
      description: "باقة متنوعة من الاستوديوهات والشقق المؤثثة بالكامل للإيجار اليومي والأسبوعي والشهري. مناسبة للأعمال والسياحة. تشمل الأثاث والأجهزة الكهربائية وخدمة الواي فاي.",
      tags: JSON.stringify(["إيجار", "مؤثثة", "شقق"]),
      deliveryTime: "متاح فوراً",
      categorySlug: "real-estate", providerId: u3.id,
      regionSlug: "eastern", citySlug: "al-khobar",
      images: [
        { url: "https://picsum.photos/seed/studio1/800/600", publicId: "stu1", width: 800, height: 600, sizeKb: 345, order: 0 },
        { url: "https://picsum.photos/seed/studio2/800/600", publicId: "stu2", width: 800, height: 600, sizeKb: 325, order: 1 },
      ],
      views: 445,
    },
    {
      title: "خدمة رهن عقاري واستشارات التمويل",
      description: "استشارات متخصصة في التمويل العقاري ومقارنة عروض البنوك السعودية. نساعدك في الحصول على أفضل نسبة فائدة وشروط سداد تناسب وضعك المالي.",
      tags: JSON.stringify(["رهن", "تمويل", "عقار"]),
      deliveryTime: "3 أيام عمل",
      categorySlug: "real-estate", providerId: u2.id,
      regionSlug: "jeddah", citySlug: "jeddah-city",
      images: [
        { url: "https://picsum.photos/seed/mortgage1/800/600", publicId: "mor1", width: 800, height: 600, sizeKb: 305, order: 0 },
        { url: "https://picsum.photos/seed/mortgage2/800/600", publicId: "mor2", width: 800, height: 600, sizeKb: 285, order: 1 },
      ],
      views: 267,
    },

    // === سفر وترفيه (6 خدمات) ===
    {
      title: "تنظيم رحلة عائلية مميزة داخل المملكة",
      description: "نخطط لك رحلة عائلية مميزة داخل المملكة تشمل: اختيار الوجهة، حجز الفنادق، برنامج يومي متكامل، والمواصلات. رحلة لا تُنسى بأقل التكاليف.",
      tags: JSON.stringify(["رحلات", "عائلة", "سياحة"]),
      deliveryTime: "تخطيط خلال يومين",
      categorySlug: "travel", providerId: u3.id,
      regionSlug: "eastern", citySlug: "dammam",
      images: [
        { url: "https://picsum.photos/seed/travel1/800/600", publicId: "tr1", width: 800, height: 600, sizeKb: 350, order: 0 },
        { url: "https://picsum.photos/seed/travel2/800/600", publicId: "tr2", width: 800, height: 600, sizeKb: 330, order: 1 },
        { url: "https://picsum.photos/seed/travel3/800/600", publicId: "tr3", width: 800, height: 600, sizeKb: 345, order: 2 },
      ],
      views: 534,
    },
    {
      title: "جولات سياحية في المواقع التاريخية",
      description: "جولات سياحية مرشدة في أبرز المواقع التاريخية والأثرية في المنطقة الشرقية. أحكي لك قصص وتاريخ كل موقع بأسلوب شيق وممتع.",
      tags: JSON.stringify(["سياحة", "تاريخ", "جولات"]),
      deliveryTime: "يوم كامل",
      categorySlug: "travel", providerId: u3.id,
      regionSlug: "eastern", citySlug: "al-ahsa",
      images: [
        { url: "https://picsum.photos/seed/tour1/800/600", publicId: "tour1", width: 800, height: 600, sizeKb: 360, order: 0 },
        { url: "https://picsum.photos/seed/tour2/800/600", publicId: "tour2", width: 800, height: 600, sizeKb: 340, order: 1 },
      ],
      views: 367,
    },
    {
      title: "تنظيم حفلات وأمسيات ترفيهية",
      description: "خدمة تنظيم احترافية للحفلات والأمسيات الترفيهية بمختلف أنواعها. نتكفل بالديكور، الضيافة، الموسيقى، والتنسيق الكامل لإنجاح مناسبتك.",
      tags: JSON.stringify(["حفلات", "مناسبات", "ترفيه"]),
      deliveryTime: "حسب المناسبة",
      categorySlug: "travel", providerId: u3.id,
      regionSlug: "qassim", citySlug: "buraidah",
      images: [
        { url: "https://picsum.photos/seed/party1/800/600", publicId: "par1", width: 800, height: 600, sizeKb: 355, order: 0 },
        { url: "https://picsum.photos/seed/party2/800/600", publicId: "par2", width: 800, height: 600, sizeKb: 335, order: 1 },
        { url: "https://picsum.photos/seed/party3/800/600", publicId: "par3", width: 800, height: 600, sizeKb: 320, order: 2 },
      ],
      views: 289,
    },
    // 3 خدمات سفر إضافية
    {
      title: "رحلة صيفية لأبها والمرتفعات",
      description: "استمتع بأجواء أبها الرائعة والمرتفعات الخضراء! نخطط لك رحلة صيفية لا تُنسى تشمل: شلالات، حدائق، أسواق شعبية، وجولات جبلية مثيرة. مناسبة للعائلات والمجموعات.",
      tags: JSON.stringify(["أبها", "صيف", "رحلة"]),
      deliveryTime: "تخطيط خلال يوم واحد",
      categorySlug: "travel", providerId: u3.id,
      regionSlug: "abha", citySlug: "abha-city",
      images: [
        { url: "https://picsum.photos/seed/abha1/800/600", publicId: "ab1", width: 800, height: 600, sizeKb: 410, order: 0 },
        { url: "https://picsum.photos/seed/abha2/800/600", publicId: "ab2", width: 800, height: 600, sizeKb: 390, order: 1 },
        { url: "https://picsum.photos/seed/abha3/800/600", publicId: "ab3", width: 800, height: 600, sizeKb: 375, order: 2 },
      ],
      views: 789,
    },
    {
      title: "تنظيم عمرة وزيارات دينية",
      description: "خدمة متكاملة لتنظيم رحلات العمرة والزيارات الدينية. تشمل التنسيق مع شركات الحافلات المرخصة، حجز الفنادق في مكة والمدينة المنورة، والمرشد الديني المعتمد.",
      tags: JSON.stringify(["عمرة", "دينية", "مكة"]),
      deliveryTime: "حسب الموعد",
      categorySlug: "travel", providerId: u3.id,
      regionSlug: "riyadh", citySlug: "riyadh-city",
      images: [
        { url: "https://picsum.photos/seed/umrah1/800/600", publicId: "um1", width: 800, height: 600, sizeKb: 380, order: 0 },
        { url: "https://picsum.photos/seed/umrah2/800/600", publicId: "um2", width: 800, height: 600, sizeKb: 355, order: 1 },
      ],
      views: 923,
    },
    {
      title: "حجوزات فندقية بأفضل الأسعار",
      description: "أحجز لك أفضل الفنادق بأفضل الأسعار في جميع مدن المملكة وخارجها. مقارنة بين عشرات الخيارات، ضمان الحصول على غرف مناسبة، وإلغاء مجاني حتى 48 ساعة.",
      tags: JSON.stringify(["فنادق", "حجوزات", "سفر"]),
      deliveryTime: "خلال ساعتين",
      categorySlug: "travel", providerId: u4.id,
      regionSlug: "eastern", citySlug: "dammam",
      images: [
        { url: "https://picsum.photos/seed/hotel1/800/600", publicId: "hot1", width: 800, height: 600, sizeKb: 365, order: 0 },
        { url: "https://picsum.photos/seed/hotel2/800/600", publicId: "hot2", width: 800, height: 600, sizeKb: 340, order: 1 },
        { url: "https://picsum.photos/seed/hotel3/800/600", publicId: "hot3", width: 800, height: 600, sizeKb: 350, order: 2 },
      ],
      views: 334,
    },

    // === ولائم وضيافة (6 خدمات) ===
    {
      title: "وليمة عربية أصيلة للمناسبات الكبيرة",
      description: "نقدم وليمة عربية فاخرة بأشهى الأطباق السعودية التقليدية: كبسة، مندي، جريش، وحلويات أصيلة. نهتم بكل التفاصيل من الطبخ حتى التقديم والتنظيف.",
      tags: JSON.stringify(["وليمة", "مناسبات", "طعام"]),
      deliveryTime: "حسب التوقيت",
      categorySlug: "catering", providerId: u4.id,
      regionSlug: "riyadh", citySlug: "riyadh-city",
      images: [
        { url: "https://picsum.photos/seed/feast1/800/600", publicId: "fe1", width: 800, height: 600, sizeKb: 380, order: 0 },
        { url: "https://picsum.photos/seed/feast2/800/600", publicId: "fe2", width: 800, height: 600, sizeKb: 365, order: 1 },
        { url: "https://picsum.photos/seed/feast3/800/600", publicId: "fe3", width: 800, height: 600, sizeKb: 350, order: 2 },
      ],
      views: 612,
    },
    {
      title: "تجهيز بوفيه متكامل للشركات والمؤتمرات",
      description: "بوفيه احترافي متكامل مناسب لاجتماعات الشركات والمؤتمرات. يشمل مشروبات ساخنة وباردة، وجبات خفيفة، وحلويات. نضمن التقديم الراقي والنظافة التامة.",
      tags: JSON.stringify(["بوفيه", "شركات", "مؤتمرات"]),
      deliveryTime: "حسب الموعد",
      categorySlug: "catering", providerId: u4.id,
      regionSlug: "riyadh", citySlug: "diriyah",
      images: [
        { url: "https://picsum.photos/seed/buffet1/800/600", publicId: "buf1", width: 800, height: 600, sizeKb: 370, order: 0 },
        { url: "https://picsum.photos/seed/buffet2/800/600", publicId: "buf2", width: 800, height: 600, sizeKb: 345, order: 1 },
      ],
      views: 445,
    },
    {
      title: "تجهيز مائدة رمضانية فاخرة",
      description: "مائدة إفطار رمضانية فاخرة مع أشهى الأطباق الرمضانية، السوائل، والحلويات الشرقية. نوصل لمنزلك في موعد الإفطار تماماً.",
      tags: JSON.stringify(["رمضان", "إفطار", "خاص"]),
      deliveryTime: "قبل المغرب بساعة",
      categorySlug: "catering", providerId: u4.id,
      regionSlug: "jeddah", citySlug: "jeddah-city",
      images: [
        { url: "https://picsum.photos/seed/ramadan1/800/600", publicId: "ram1", width: 800, height: 600, sizeKb: 375, order: 0 },
        { url: "https://picsum.photos/seed/ramadan2/800/600", publicId: "ram2", width: 800, height: 600, sizeKb: 355, order: 1 },
        { url: "https://picsum.photos/seed/ramadan3/800/600", publicId: "ram3", width: 800, height: 600, sizeKb: 340, order: 2 },
      ],
      views: 723,
    },
    // 3 خدمات ولائم إضافية
    {
      title: "حلويات ومعجنات فاخرة للمناسبات",
      description: "تحضير حلويات عربية وغربية فاخرة للمناسبات والأعياد. كنافة، بسبوسة، تشيز كيك، ماكارون. جميع المنتجات طازجة يومياً من مكونات فاخرة. توصيل للمنزل مع تغليف احترافي.",
      tags: JSON.stringify(["حلويات", "مناسبات", "معجنات"]),
      deliveryTime: "24 ساعة مسبقاً",
      categorySlug: "catering", providerId: u4.id,
      regionSlug: "qassim", citySlug: "buraidah",
      images: [
        { url: "https://picsum.photos/seed/sweets1/800/600", publicId: "sw1", width: 800, height: 600, sizeKb: 385, order: 0 },
        { url: "https://picsum.photos/seed/sweets2/800/600", publicId: "sw2", width: 800, height: 600, sizeKb: 360, order: 1 },
        { url: "https://picsum.photos/seed/sweets3/800/600", publicId: "sw3", width: 800, height: 600, sizeKb: 370, order: 2 },
      ],
      views: 512,
    },
    {
      title: "خدمة قهوة وضيافة عربية",
      description: "خدمة ضيافة عربية أصيلة لمجالسك وفعالياتك. تشمل قهوة عربية مع الهيل والزعفران، تمر فاخر، وعصائر طازجة. ندير خدمة القهوة بأدب وكرم تقليدي أصيل.",
      tags: JSON.stringify(["قهوة", "ضيافة", "عربية"]),
      deliveryTime: "حسب الفعالية",
      categorySlug: "catering", providerId: u4.id,
      regionSlug: "riyadh", citySlug: "diriyah",
      images: [
        { url: "https://picsum.photos/seed/coffee1/800/600", publicId: "cof1", width: 800, height: 600, sizeKb: 360, order: 0 },
        { url: "https://picsum.photos/seed/coffee2/800/600", publicId: "cof2", width: 800, height: 600, sizeKb: 340, order: 1 },
      ],
      views: 678,
    },
    {
      title: "طبخ منزلي يومي بالاشتراك الشهري",
      description: "خدمة طبخ منزلي يومية تضمن وجبات صحية ولذيذة لعائلتك. قائمة أسبوعية متنوعة، استخدام مكونات طازجة، ومراعاة التفضيلات الغذائية لكل فرد في العائلة.",
      tags: JSON.stringify(["طبخ", "منزلي", "اشتراك"]),
      deliveryTime: "يومي",
      categorySlug: "catering", providerId: u4.id,
      regionSlug: "eastern", citySlug: "al-khobar",
      images: [
        { url: "https://picsum.photos/seed/homecook1/800/600", publicId: "hc1", width: 800, height: 600, sizeKb: 355, order: 0 },
        { url: "https://picsum.photos/seed/homecook2/800/600", publicId: "hc2", width: 800, height: 600, sizeKb: 330, order: 1 },
        { url: "https://picsum.photos/seed/homecook3/800/600", publicId: "hc3", width: 800, height: 600, sizeKb: 345, order: 2 },
      ],
      views: 289,
    },

    // === عناية ورفاهية (8 خدمات) ===
    {
      title: "تدريب شخصي للياقة البدنية في منزلك",
      description: "أتي إلى منزلك لتدريبك على أحدث تمارين اللياقة البدنية مع وضع برنامج غذائي مخصص. مدرب معتمد دولياً بخبرة 8 سنوات في التدريب الشخصي.",
      tags: JSON.stringify(["لياقة", "تدريب", "صحة"]),
      deliveryTime: "جلسة ساعة",
      categorySlug: "wellness", providerId: u5.id,
      regionSlug: "qassim", citySlug: "buraidah",
      images: [
        { url: "https://picsum.photos/seed/fitness1/800/600", publicId: "fit1", width: 800, height: 600, sizeKb: 325, order: 0 },
        { url: "https://picsum.photos/seed/fitness2/800/600", publicId: "fit2", width: 800, height: 600, sizeKb: 308, order: 1 },
        { url: "https://picsum.photos/seed/fitness3/800/600", publicId: "fit3", width: 800, height: 600, sizeKb: 315, order: 2 },
      ],
      views: 398,
    },
    {
      title: "جلسة مساج علاجي وإسترخاء",
      description: "جلسة مساج علاجي احترافية لتخفيف التوتر وآلام الظهر والمفاصل. أستخدم تقنيات متعددة مناسبة لكل حالة مع زيوت عطرية طبيعية.",
      tags: JSON.stringify(["مساج", "علاجي", "استرخاء"]),
      deliveryTime: "ساعة ونصف",
      categorySlug: "wellness", providerId: u5.id,
      regionSlug: "qassim", citySlug: "unaizah",
      images: [
        { url: "https://picsum.photos/seed/massage1/800/600", publicId: "mas1", width: 800, height: 600, sizeKb: 295, order: 0 },
        { url: "https://picsum.photos/seed/massage2/800/600", publicId: "mas2", width: 800, height: 600, sizeKb: 278, order: 1 },
      ],
      views: 267,
    },
    {
      title: "خدمة العناية بالبشرة والتجميل المنزلي",
      description: "خدمة تجميل منزلية متكاملة: عناية بالبشرة، مكياج، وعلاجات تجميلية. أحضر لك مستلزمات عالية الجودة وأقدم لك تجربة سبا منزلية فاخرة.",
      tags: JSON.stringify(["تجميل", "بشرة", "سبا"]),
      deliveryTime: "3 ساعات",
      categorySlug: "wellness", providerId: u6.id,
      regionSlug: "abha", citySlug: "abha-city",
      images: [
        { url: "https://picsum.photos/seed/beauty1/800/600", publicId: "bea1", width: 800, height: 600, sizeKb: 285, order: 0 },
        { url: "https://picsum.photos/seed/beauty2/800/600", publicId: "bea2", width: 800, height: 600, sizeKb: 270, order: 1 },
        { url: "https://picsum.photos/seed/beauty3/800/600", publicId: "bea3", width: 800, height: 600, sizeKb: 262, order: 2 },
      ],
      views: 334,
    },
    {
      title: "برنامج تغذية صحية مخصص",
      description: "إعداد خطة غذائية متكاملة مخصصة حسب حالتك الصحية وأهدافك. تشمل: تحليل الوضع الغذائي، خطة وجبات أسبوعية، ومتابعة دورية.",
      tags: JSON.stringify(["تغذية", "صحة", "حمية"]),
      deliveryTime: "خطة أسبوعية",
      categorySlug: "wellness", providerId: u5.id,
      regionSlug: "eastern", citySlug: "al-khobar",
      images: [
        { url: "https://picsum.photos/seed/nutrition1/800/600", publicId: "nut1", width: 800, height: 600, sizeKb: 290, order: 0 },
        { url: "https://picsum.photos/seed/nutrition2/800/600", publicId: "nut2", width: 800, height: 600, sizeKb: 275, order: 1 },
      ],
      views: 456,
    },
    // 4 خدمات عناية إضافية
    {
      title: "جلسات يوغا وتأمل منزلية",
      description: "جلسات يوغا وتأمل هادئة في منزلك مع مدربة معتمدة. مناسبة للمبتدئين والمتقدمين. تساعد في تخفيف التوتر، تحسين المرونة، والتوازن الذهني والجسدي.",
      tags: JSON.stringify(["يوغا", "تأمل", "استرخاء"]),
      deliveryTime: "ساعة لكل جلسة",
      categorySlug: "wellness", providerId: u5.id,
      regionSlug: "abha", citySlug: "khamis-mushait",
      images: [
        { url: "https://picsum.photos/seed/yoga1/800/600", publicId: "yog1", width: 800, height: 600, sizeKb: 298, order: 0 },
        { url: "https://picsum.photos/seed/yoga2/800/600", publicId: "yog2", width: 800, height: 600, sizeKb: 280, order: 1 },
        { url: "https://picsum.photos/seed/yoga3/800/600", publicId: "yog3", width: 800, height: 600, sizeKb: 275, order: 2 },
      ],
      views: 423,
    },
    {
      title: "علاجات طبيعية بالأعشاب",
      description: "علاجات طبيعية مستخدمة بالأعشاب الطبية المعتمدة لعلاج الحالات المزمنة كضغط الدم، السكر، والقولون. استشارة مجانية وخطة علاجية مخصصة لكل حالة.",
      tags: JSON.stringify(["أعشاب", "طبيعي", "علاج"]),
      deliveryTime: "استشارة + خطة خلال يومين",
      categorySlug: "wellness", providerId: u6.id,
      regionSlug: "jeddah", citySlug: "jeddah-city",
      images: [
        { url: "https://picsum.photos/seed/herbs1/800/600", publicId: "her1", width: 800, height: 600, sizeKb: 285, order: 0 },
        { url: "https://picsum.photos/seed/herbs2/800/600", publicId: "her2", width: 800, height: 600, sizeKb: 268, order: 1 },
      ],
      views: 198,
    },
    {
      title: "حجامة طبية معتمدة",
      description: "جلسات حجامة طبية معتمدة بأدوات معقمة ومعتمدة صحياً. تساعد في تحسين الدورة الدموية وعلاج الآلام المزمنة. تُجرى من قِبَل متخصص حاصل على شهادة معتمدة في الطب النبوي.",
      tags: JSON.stringify(["حجامة", "طبية", "صحة"]),
      deliveryTime: "ساعة واحدة",
      categorySlug: "wellness", providerId: u5.id,
      regionSlug: "riyadh", citySlug: "riyadh-city",
      images: [
        { url: "https://picsum.photos/seed/hijama1/800/600", publicId: "hij1", width: 800, height: 600, sizeKb: 292, order: 0 },
        { url: "https://picsum.photos/seed/hijama2/800/600", publicId: "hij2", width: 800, height: 600, sizeKb: 275, order: 1 },
        { url: "https://picsum.photos/seed/hijama3/800/600", publicId: "hij3", width: 800, height: 600, sizeKb: 280, order: 2 },
      ],
      views: 567,
    },
    {
      title: "مساج استرخاء للسيدات",
      description: "جلسات مساج استرخاء متخصصة للسيدات مع مدربة معتمدة. زيوت عطرية فاخرة، أجواء هادئة، وتجربة سبا منزلية راقية. متاح للحجز في المنزل أو الاستوديو.",
      tags: JSON.stringify(["مساج", "سيدات", "استرخاء"]),
      deliveryTime: "ساعتان",
      categorySlug: "wellness", providerId: u6.id,
      regionSlug: "eastern", citySlug: "al-khobar",
      images: [
        { url: "https://picsum.photos/seed/ladymassage1/800/600", publicId: "lm1", width: 800, height: 600, sizeKb: 288, order: 0 },
        { url: "https://picsum.photos/seed/ladymassage2/800/600", publicId: "lm2", width: 800, height: 600, sizeKb: 270, order: 1 },
      ],
      views: 345,
    },

    // === التدريب والتعليم (7 خدمات) ===
    {
      title: "تدريس اللغة الإنجليزية لجميع المستويات",
      description: "حصص خصوصية في اللغة الإنجليزية لجميع المراحل الدراسية والبالغين. منهج مبتكر يركز على المحادثة والقواعد معاً. نتائج مضمونة خلال شهر.",
      tags: JSON.stringify(["إنجليزي", "تدريس", "خصوصي"]),
      deliveryTime: "ساعة لكل حصة",
      categorySlug: "education", providerId: u6.id,
      regionSlug: "abha", citySlug: "khamis-mushait",
      images: [
        { url: "https://picsum.photos/seed/english1/800/600", publicId: "eng1", width: 800, height: 600, sizeKb: 265, order: 0 },
        { url: "https://picsum.photos/seed/english2/800/600", publicId: "eng2", width: 800, height: 600, sizeKb: 248, order: 1 },
        { url: "https://picsum.photos/seed/english3/800/600", publicId: "eng3", width: 800, height: 600, sizeKb: 258, order: 2 },
      ],
      views: 589,
    },
    {
      title: "دورة تأسيس الرياضيات والعلوم",
      description: "دورة تأسيسية مكثفة في الرياضيات والعلوم للمراحل الابتدائية والمتوسطة. أستخدم أساليب تفاعلية وألعاب تعليمية لتحبيب الطالب في المادة.",
      tags: JSON.stringify(["رياضيات", "علوم", "تأسيس"]),
      deliveryTime: "ساعتان لكل حصة",
      categorySlug: "education", providerId: u6.id,
      regionSlug: "abha", citySlug: "al-namas",
      images: [
        { url: "https://picsum.photos/seed/math1/800/600", publicId: "mat1", width: 800, height: 600, sizeKb: 258, order: 0 },
        { url: "https://picsum.photos/seed/math2/800/600", publicId: "mat2", width: 800, height: 600, sizeKb: 242, order: 1 },
      ],
      views: 412,
    },
    {
      title: "تدريب على مهارات البرمجة للمبتدئين",
      description: "تعلم البرمجة من الصفر! دورة شاملة تغطي: Python، HTML/CSS، وأساسيات JavaScript. مع مشاريع تطبيقية حقيقية تضيفها لسيرتك الذاتية.",
      tags: JSON.stringify(["برمجة", "تقنية", "مبتدئين"]),
      deliveryTime: "8 أسابيع",
      categorySlug: "education", providerId: u5.id,
      regionSlug: "qassim", citySlug: "al-rass",
      images: [
        { url: "https://picsum.photos/seed/coding1/800/600", publicId: "cod1", width: 800, height: 600, sizeKb: 272, order: 0 },
        { url: "https://picsum.photos/seed/coding2/800/600", publicId: "cod2", width: 800, height: 600, sizeKb: 255, order: 1 },
        { url: "https://picsum.photos/seed/coding3/800/600", publicId: "cod3", width: 800, height: 600, sizeKb: 265, order: 2 },
      ],
      views: 678,
    },
    // 4 خدمات تعليم إضافية
    {
      title: "تحضير IELTS وTOEFL",
      description: "دورة مكثفة للتحضير لاختبارات IELTS وTOEFL. استراتيجيات مجربة لرفع الدرجات في وقت قصير. مواد دراسية، اختبارات تجريبية، وتغذية راجعة مفصلة لكل مهارة.",
      tags: JSON.stringify(["IELTS", "TOEFL", "إنجليزي"]),
      deliveryTime: "4-6 أسابيع",
      categorySlug: "education", providerId: u6.id,
      regionSlug: "riyadh", citySlug: "riyadh-city",
      images: [
        { url: "https://picsum.photos/seed/ielts1/800/600", publicId: "iel1", width: 800, height: 600, sizeKb: 260, order: 0 },
        { url: "https://picsum.photos/seed/ielts2/800/600", publicId: "iel2", width: 800, height: 600, sizeKb: 245, order: 1 },
        { url: "https://picsum.photos/seed/ielts3/800/600", publicId: "iel3", width: 800, height: 600, sizeKb: 255, order: 2 },
      ],
      views: 834,
    },
    {
      title: "دروس القرآن الكريم والتجويد",
      description: "تعلم تلاوة القرآن الكريم بأحكام التجويد الصحيحة مع مقرئ معتمد من الأزهر. مناسب للكبار والصغار. جلسات أونلاين أو حضورية حسب الرغبة.",
      tags: JSON.stringify(["قرآن", "تجويد", "تحفيظ"]),
      deliveryTime: "ساعة لكل جلسة",
      categorySlug: "education", providerId: u6.id,
      regionSlug: "qassim", citySlug: "unaizah",
      images: [
        { url: "https://picsum.photos/seed/quran1/800/600", publicId: "qur1", width: 800, height: 600, sizeKb: 252, order: 0 },
        { url: "https://picsum.photos/seed/quran2/800/600", publicId: "qur2", width: 800, height: 600, sizeKb: 240, order: 1 },
      ],
      views: 1123,
    },
    {
      title: "تدريب Excel وWord المتقدم",
      description: "دورة متقدمة في برامج Microsoft Office: Excel المتقدم (Pivot، VLOOKUP، Macros) وWord الاحترافي. مناسبة للموظفين وأصحاب الأعمال لتوفير الوقت والإنتاجية.",
      tags: JSON.stringify(["Excel", "Word", "Office"]),
      deliveryTime: "3 أسابيع",
      categorySlug: "education", providerId: u5.id,
      regionSlug: "eastern", citySlug: "dammam",
      images: [
        { url: "https://picsum.photos/seed/excel1/800/600", publicId: "exc1", width: 800, height: 600, sizeKb: 258, order: 0 },
        { url: "https://picsum.photos/seed/excel2/800/600", publicId: "exc2", width: 800, height: 600, sizeKb: 242, order: 1 },
        { url: "https://picsum.photos/seed/excel3/800/600", publicId: "exc3", width: 800, height: 600, sizeKb: 250, order: 2 },
      ],
      views: 445,
    },
    {
      title: "تعليم الخط العربي والزخرفة",
      description: "تعلم فن الخط العربي الجميل من الصفر حتى الاحتراف. دروس في النسخ، الرقعة، الثلث، والزخرفة الإسلامية. مناسب لمحبي الفنون والخطاطين الهواة.",
      tags: JSON.stringify(["خط", "عربي", "فن"]),
      deliveryTime: "ساعة ونصف لكل حصة",
      categorySlug: "education", providerId: u4.id,
      regionSlug: "abha", citySlug: "abha-city",
      images: [
        { url: "https://picsum.photos/seed/calligraphy1/800/600", publicId: "cal1", width: 800, height: 600, sizeKb: 265, order: 0 },
        { url: "https://picsum.photos/seed/calligraphy2/800/600", publicId: "cal2", width: 800, height: 600, sizeKb: 250, order: 1 },
      ],
      views: 234,
    },
  ];

  const createdServices: string[] = [];
  for (const svc of servicesData) {
    const { images, categorySlug, regionSlug, citySlug, ...serviceData } = svc;
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        categoryId: categories[categorySlug],
        regionId: regions[regionSlug],
        cityId: cities[citySlug],
        images: { create: images },
      },
    });
    createdServices.push(service.id);
    console.log(`   ✅ ${serviceData.title.substring(0, 50)}`);
  }
  console.log(`\n   📊 تم إنشاء ${createdServices.length} خدمة\n`);

  // ══════════════════════════════════════
  // 6. الحجوزات التجريبية (35 حجز)
  // ══════════════════════════════════════
  console.log("📋 إنشاء الحجوزات التجريبية...");

  // بيانات الحجوزات: [serviceIndex, clientId, status, paymentStatus, canRate, notes, paymentRef?]
  type BookingDef = {
    serviceIdx: number;
    clientId: string;
    status: string;
    paymentStatus: string;
    canRate: boolean;
    notes: string;
    paymentRef?: string;
    raterId?: string;
    providerId?: string;
    score?: number;
    comment?: string;
  };

  const bookingDefs: BookingDef[] = [
    // === مكتمل + مدفوع + مُقيَّم (25 حجز) ===
    { serviceIdx: 0,  clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "أحتاج الاستشارة قبل توقيع العقد", paymentRef: "PAY-001-2024", raterId: u7.id, providerId: u1.id, score: 5, comment: "خدمة ممتازة جداً، المحامي محترف ومتعاون. أنصح الجميع بالتواصل معه." },
    { serviceIdx: 1,  clientId: admin.id, status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "متابعة قضية فصل تعسفي", paymentRef: "PAY-002-2024", raterId: admin.id, providerId: u1.id, score: 5, comment: "محامي محترف ومتابع للقضية باستمرار. حصلت على حقوقي كاملة." },
    { serviceIdx: 2,  clientId: u8.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "استشارة لاستثمار مبلغ 500 ألف ريال", paymentRef: "PAY-003-2024", raterId: u8.id, providerId: u2.id, score: 5, comment: "استشارة مالية رائعة وخطة محكمة. شكراً." },
    { serviceIdx: 3,  clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "توثيق عقد بيع سيارة", paymentRef: "PAY-004-2024", raterId: u7.id, providerId: u1.id, score: 4, comment: "خدمة جيدة وسريعة. العقد واضح ومفصل." },
    { serviceIdx: 4,  clientId: admin.id, status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "تسوية ضريبة القيمة المضافة للسنة الماضية", paymentRef: "PAY-005-2024", raterId: admin.id, providerId: u1.id, score: 5, comment: "متخصص حقيقي في الشأن الضريبي. وفر علينا الكثير." },
    { serviceIdx: 5,  clientId: u8.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "تأسيس مؤسسة فردية لتجارة الإلكترونيات", paymentRef: "PAY-006-2024", raterId: u8.id, providerId: u1.id, score: 5, comment: "إجراءات سلسة وسريعة. الشركة أسست في أقل من أسبوعين." },
    { serviceIdx: 7,  clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "تقييم فيلا في حي النزهة بجدة", paymentRef: "PAY-007-2024", raterId: u7.id, providerId: u2.id, score: 5, comment: "تقرير التقييم احترافي ومفصل. أنصح به." },
    { serviceIdx: 8,  clientId: admin.id, status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "البحث عن شقة في حي الشاطئ", paymentRef: "PAY-008-2024", raterId: admin.id, providerId: u2.id, score: 4, comment: "وجدت الشقة المناسبة بعد 5 أيام فقط. ممتاز." },
    { serviceIdx: 9,  clientId: u8.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "إدارة عمارة من 8 شقق في الرياض", paymentRef: "PAY-009-2024", raterId: u8.id, providerId: u2.id, score: 5, comment: "إدارة احترافية ومتابعة دورية. ريحتني من المتاعب." },
    { serviceIdx: 10, clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "تصوير شقتين للإيجار", paymentRef: "PAY-010-2024", raterId: u7.id, providerId: u2.id, score: 5, comment: "صور احترافية جداً. الشقق أُجرت في أسبوع بعد نشر الصور." },
    { serviceIdx: 13, clientId: admin.id, status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "رحلة عائلية لـ 5 أفراد لمدة 3 أيام", paymentRef: "PAY-011-2024", raterId: admin.id, providerId: u3.id, score: 5, comment: "تنظيم رائع! الرحلة كانت أحلى من توقعاتنا. شكراً جزيلاً." },
    { serviceIdx: 14, clientId: u8.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "جولة في الأحساء التاريخية", paymentRef: "PAY-012-2024", raterId: u8.id, providerId: u3.id, score: 5, comment: "مرشد سياحي ممتاز. معلوماته عن التاريخ رائعة." },
    { serviceIdx: 15, clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "حفل زفاف لـ 200 ضيف في القصيم", paymentRef: "PAY-013-2024", raterId: u7.id, providerId: u3.id, score: 4, comment: "حفل ناجح بكل المقاييس. شكراً على التنظيم." },
    { serviceIdx: 16, clientId: admin.id, status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "رحلة أبها لـ 8 أشخاص", paymentRef: "PAY-014-2024", raterId: admin.id, providerId: u3.id, score: 5, comment: "أبها رائعة والتنظيم كان أروع. نعود قريباً!" },
    { serviceIdx: 17, clientId: u8.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "عمرة لـ 4 أفراد", paymentRef: "PAY-015-2024", raterId: u8.id, providerId: u3.id, score: 5, comment: "تنظيم مثالي للعمرة. الفندق ممتاز وقريب من الحرم." },
    { serviceIdx: 19, clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "وليمة عشاء لـ 80 شخص لمناسبة زواج", paymentRef: "PAY-016-2024", raterId: u7.id, providerId: u4.id, score: 5, comment: "الطعام لذيذ جداً والخدمة ممتازة. نشكرهم بشدة." },
    { serviceIdx: 20, clientId: admin.id, status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "بوفيه اجتماع ربع السنوي", paymentRef: "PAY-017-2024", raterId: admin.id, providerId: u4.id, score: 4, comment: "بوفيه متنوع وراقي. الحضور أعجبوا كثيراً." },
    { serviceIdx: 22, clientId: u8.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "طلب حلويات لحفل خطوبة", paymentRef: "PAY-018-2024", raterId: u8.id, providerId: u4.id, score: 5, comment: "حلويات فاخرة وشكل جميل. الضيوف أعجبوا كثيراً." },
    { serviceIdx: 23, clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "قهوة عربية لمجلس ضيافة أسبوعي", paymentRef: "PAY-019-2024", raterId: u7.id, providerId: u4.id, score: 5, comment: "قهوة أصيلة وخدمة راقية. أعاد الاشتراك مرة أخرى." },
    { serviceIdx: 25, clientId: admin.id, status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "تدريب شخصي 3 مرات أسبوعياً لشهر", paymentRef: "PAY-020-2024", raterId: admin.id, providerId: u5.id, score: 5, comment: "مدرب محترف ومتابع. فقدت 5 كيلو في شهر واحد!" },
    { serviceIdx: 26, clientId: u8.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "مساج علاجي لآلام الظهر المزمنة", paymentRef: "PAY-021-2024", raterId: u8.id, providerId: u5.id, score: 5, comment: "تحسن ملحوظ بعد 3 جلسات. أنصح به بشدة." },
    { serviceIdx: 29, clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "جلسات يوغا 4 مرات في الأسبوع", paymentRef: "PAY-022-2024", raterId: u7.id, providerId: u5.id, score: 4, comment: "جلسات ممتعة ومفيدة. تحسن ملحوظ في المرونة." },
    { serviceIdx: 33, clientId: admin.id, status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "حصص إنجليزي 3 مرات أسبوعياً لمدة شهرين", paymentRef: "PAY-023-2024", raterId: admin.id, providerId: u6.id, score: 5, comment: "مدرسة رائعة. مستواي تحسن بشكل ملحوظ." },
    { serviceIdx: 36, clientId: u8.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "تحضير IELTS لاستخراج تأشيرة أكاديمية", paymentRef: "PAY-024-2024", raterId: u8.id, providerId: u6.id, score: 5, comment: "حصلت على 7.5 في الاختبار! الأستاذة ممتازة." },
    { serviceIdx: 37, clientId: u7.id,    status: "COMPLETED", paymentStatus: "PAID", canRate: true, notes: "دروس تجويد للأطفال", paymentRef: "PAY-025-2024", raterId: u7.id, providerId: u6.id, score: 5, comment: "أسلوب رائع مع الأطفال. ابني تعلم التجويد بسرعة مذهلة." },

    // === مكتمل + قيد الانتظار الدفع (3 حجوزات) ===
    { serviceIdx: 6,  clientId: u8.id,    status: "COMPLETED", paymentStatus: "PENDING", canRate: false, notes: "متابعة قضية تحكيم في عقد مقاولات" },
    { serviceIdx: 11, clientId: u7.id,    status: "COMPLETED", paymentStatus: "PENDING", canRate: false, notes: "تقييم شقة في حي النزهة" },
    { serviceIdx: 28, clientId: admin.id, status: "COMPLETED", paymentStatus: "PENDING", canRate: false, notes: "حجامة علاجية لآلام الرقبة" },

    // === مؤكد (CONFIRMED) (3 حجوزات) ===
    { serviceIdx: 18, clientId: u8.id,    status: "CONFIRMED", paymentStatus: "PAID",    canRate: false, notes: "حجز فندق لعائلة 5 أفراد في أبها", paymentRef: "PAY-026-2024" },
    { serviceIdx: 24, clientId: u7.id,    status: "CONFIRMED", paymentStatus: "PAID",    canRate: false, notes: "اشتراك طبخ منزلي لمدة شهر", paymentRef: "PAY-027-2024" },
    { serviceIdx: 39, clientId: admin.id, status: "CONFIRMED", paymentStatus: "PENDING", canRate: false, notes: "دروس خط عربي للمبتدئين" },

    // === قيد الانتظار (PENDING) (4 حجوزات) ===
    { serviceIdx: 12, clientId: u8.id,    status: "PENDING", paymentStatus: "PENDING", canRate: false, notes: "استفسار عن رهن عقاري لشراء منزل" },
    { serviceIdx: 21, clientId: u7.id,    status: "PENDING", paymentStatus: "PENDING", canRate: false, notes: "مائدة إفطار رمضانية لـ 20 شخص" },
    { serviceIdx: 27, clientId: admin.id, status: "PENDING", paymentStatus: "PENDING", canRate: false, notes: "خطة تغذية صحية لفقدان الوزن" },
    { serviceIdx: 38, clientId: u8.id,    status: "PENDING", paymentStatus: "PENDING", canRate: false, notes: "دورة Excel المتقدم للموظفين" },
  ];

  let bookingCount = 0;
  for (const def of bookingDefs) {
    const booking = await prisma.booking.create({
      data: {
        status: def.status,
        paymentStatus: def.paymentStatus,
        canRate: def.canRate,
        serviceFee: 50,
        notes: def.notes,
        serviceId: createdServices[def.serviceIdx],
        clientId: def.clientId,
        ...(def.paymentRef ? { paymentRef: def.paymentRef } : {}),
      },
    });

    if (def.score && def.raterId && def.providerId && def.comment) {
      await prisma.rating.create({
        data: {
          score: def.score,
          comment: def.comment,
          bookingId: booking.id,
          raterId: def.raterId,
          providerId: def.providerId,
          serviceId: createdServices[def.serviceIdx],
        },
      });
    }
    bookingCount++;
  }

  console.log(`   ✅ ${bookingCount} حجز (25 مكتمل ومدفوع، 3 مكتمل بانتظار الدفع، 3 مؤكد، 4 قيد الانتظار)\n`);

  // تحديث متوسط تقييمات المزودين
  await prisma.user.update({ where: { id: u1.id }, data: { rating: 4.8, totalRatings: 6 } });
  await prisma.user.update({ where: { id: u2.id }, data: { rating: 4.8, totalRatings: 4 } });
  await prisma.user.update({ where: { id: u3.id }, data: { rating: 4.8, totalRatings: 5 } });
  await prisma.user.update({ where: { id: u4.id }, data: { rating: 4.8, totalRatings: 4 } });
  await prisma.user.update({ where: { id: u5.id }, data: { rating: 4.7, totalRatings: 3 } });
  await prisma.user.update({ where: { id: u6.id }, data: { rating: 5.0, totalRatings: 3 } });

  console.log("══════════════════════════════════════════");
  console.log("✅  اكتمل زرع البيانات التجريبية بنجاح!");
  console.log("══════════════════════════════════════════");
  console.log(`\n📊 الملخص:`);
  console.log(`   • الإعدادات: 2 (رسوم المنصة: 50 ريال)`);
  console.log(`   • التصنيفات: ${categoriesData.length}`);
  console.log(`   • المناطق: ${regionsData.length} (${regionsData.reduce((s,r)=>s+r.cities.length,0)} مدينة)`);
  console.log(`   • المستخدمون: ${users.length + 1} (بما فيهم المدير)`);
  console.log(`   • الخدمات: ${createdServices.length}`);
  console.log(`   • الحجوزات: ${bookingCount} (25 تقييم)`);
  console.log(`\n🔑 حساب المدير:`);
  console.log(`   الجوال: 0500000000`);
  console.log(`   الدور: ADMIN\n`);
}

main()
  .catch((e) => {
    console.error("❌ خطأ في زرع البيانات:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
