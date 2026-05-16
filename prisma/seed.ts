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
    update: { value: "10" },
    create: { key: "SERVICE_FEE", value: "10" },
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
  // 3. المناطق والمدن (المرحلة الأولى)
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
  // 4. المستخدمون التجريبيون
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
  ]);

  const [u1, u2, u3, u4, u5, u6, u7] = users;
  console.log(`   ✅ تم إنشاء ${users.length + 1} مستخدم (بما فيهم المدير)\n`);

  // ══════════════════════════════════════
  // 5. الخدمات التجريبية (20 خدمة)
  // ══════════════════════════════════════
  console.log("🛠️  إنشاء الخدمات التجريبية...");

  const servicesData = [
    // === استشارات وقضايا (4 خدمات) ===
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

    // === عقارات وأملاك (3 خدمات) ===
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

    // === سفر وترفيه (3 خدمات) ===
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

    // === ولائم وضيافة (3 خدمات) ===
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

    // === عناية ورفاهية (4 خدمات) ===
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

    // === التدريب والتعليم (3 خدمات) ===
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
    console.log(`   ✅ ${serviceData.title.substring(0, 40)}...`);
  }
  console.log(`\n   📊 تم إنشاء ${createdServices.length} خدمة\n`);

  // ══════════════════════════════════════
  // 6. الحجوزات التجريبية (5 حجوزات)
  // ══════════════════════════════════════
  console.log("📋 إنشاء الحجوزات التجريبية...");

  // حجز 1: مكتمل + مدفوع + مُقيَّم (لعرض التقييمات)
  const booking1 = await prisma.booking.create({
    data: {
      status: "COMPLETED",
      paymentStatus: "PAID",
      canRate: true,
      serviceFee: 10,
      notes: "أحتاج الاستشارة قبل توقيع العقد",
      serviceId: createdServices[0],
      clientId: u7.id,
      paymentRef: "PAY-001-2024",
    },
  });
  await prisma.rating.create({
    data: {
      score: 5,
      comment: "خدمة ممتازة جداً، المحامي محترف ومتعاون. أنصح الجميع بالتواصل معه.",
      bookingId: booking1.id,
      raterId: u7.id,
      providerId: u1.id,
      serviceId: createdServices[0],
    },
  });

  // حجز 2: مكتمل + مدفوع + مُقيَّم
  const booking2 = await prisma.booking.create({
    data: {
      status: "COMPLETED",
      paymentStatus: "PAID",
      canRate: true,
      serviceFee: 10,
      notes: "رحلة عائلية لـ 5 أفراد لمدة 3 أيام",
      serviceId: createdServices[7],
      clientId: admin.id,
      paymentRef: "PAY-002-2024",
    },
  });
  await prisma.rating.create({
    data: {
      score: 5,
      comment: "تنظيم رائع! الرحلة كانت أحلى من توقعاتنا. شكراً جزيلاً.",
      bookingId: booking2.id,
      raterId: admin.id,
      providerId: u3.id,
      serviceId: createdServices[7],
    },
  });

  // حجز 3: مكتمل + مدفوع + مُقيَّم
  const booking3 = await prisma.booking.create({
    data: {
      status: "COMPLETED",
      paymentStatus: "PAID",
      canRate: true,
      serviceFee: 10,
      notes: "وليمة غداء لـ 50 شخص",
      serviceId: createdServices[10],
      clientId: u7.id,
      paymentRef: "PAY-003-2024",
    },
  });
  await prisma.rating.create({
    data: {
      score: 4,
      comment: "الطعام لذيذ والخدمة سريعة. الوليمة كانت ناجحة بامتياز.",
      bookingId: booking3.id,
      raterId: u7.id,
      providerId: u4.id,
      serviceId: createdServices[10],
    },
  });

  // حجز 4: مكتمل + في انتظار الدفع
  await prisma.booking.create({
    data: {
      status: "COMPLETED",
      paymentStatus: "PENDING",
      canRate: false,
      serviceFee: 10,
      notes: "تقييم شقة في حي النزهة",
      serviceId: createdServices[4],
      clientId: u7.id,
    },
  });

  // حجز 5: قيد الانتظار (PENDING)
  await prisma.booking.create({
    data: {
      status: "PENDING",
      paymentStatus: "PENDING",
      canRate: false,
      serviceFee: 10,
      notes: "حصص إنجليزي 3 مرات أسبوعياً",
      serviceId: createdServices[17],
      clientId: admin.id,
    },
  });

  console.log("   ✅ 5 حجوزات (3 مكتملة ومقيَّمة، 1 مكتملة بانتظار الدفع، 1 قيد الانتظار)\n");

  // تحديث متوسط تقييمات المزودين
  await prisma.user.update({ where: { id: u1.id }, data: { rating: 5.0, totalRatings: 1 } });
  await prisma.user.update({ where: { id: u3.id }, data: { rating: 5.0, totalRatings: 1 } });
  await prisma.user.update({ where: { id: u4.id }, data: { rating: 4.0, totalRatings: 1 } });

  console.log("══════════════════════════════════════════");
  console.log("✅  اكتمل زرع البيانات التجريبية بنجاح!");
  console.log("══════════════════════════════════════════");
  console.log(`\n📊 الملخص:`);
  console.log(`   • الإعدادات: 2`);
  console.log(`   • التصنيفات: ${categoriesData.length}`);
  console.log(`   • المناطق: ${regionsData.length} (${regionsData.reduce((s,r)=>s+r.cities.length,0)} مدينة)`);
  console.log(`   • المستخدمون: ${users.length + 1} (بما فيهم المدير)`);
  console.log(`   • الخدمات: ${createdServices.length}`);
  console.log(`   • الحجوزات: 5 (3 تقييمات)`);
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
