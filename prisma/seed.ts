import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: [] });

async function main() {
  console.log("🌱 بدء زرع البيانات التجريبية...\n");

  // ══════════════════════════════════════
  // 1. إعدادات المنصة
  // ══════════════════════════════════════
  console.log("⚙️  إنشاء إعدادات المنصة...");
  await prisma.settings.upsert({ where: { key: "SERVICE_FEE" }, update: { value: "50" }, create: { key: "SERVICE_FEE", value: "50" } });
  await prisma.settings.upsert({ where: { key: "PLATFORM_NAME" }, update: { value: "منصة خدمات" }, create: { key: "PLATFORM_NAME", value: "منصة خدمات" } });
  console.log("   ✅ الإعدادات\n");

  // ══════════════════════════════════════
  // 2. التصنيفات
  // ══════════════════════════════════════
  console.log("📂 إنشاء التصنيفات...");
  const cats = [
    { name: "استشارات وقضايا", slug: "consultations", icon: "⚖️", color: "#6366F1", order: 1 },
    { name: "عقارات وأملاك",   slug: "real-estate",   icon: "🏢", color: "#0EA5E9", order: 2 },
    { name: "سفر وترفيه",      slug: "travel",        icon: "✈️", color: "#F59E0B", order: 3 },
    { name: "ولائم وضيافة",    slug: "catering",      icon: "🍽️", color: "#EF4444", order: 4 },
    { name: "عناية ورفاهية",   slug: "wellness",      icon: "✨", color: "#EC4899", order: 5 },
    { name: "التدريب والتعليم",slug: "education",     icon: "🎓", color: "#10B981", order: 6 },
  ];
  const C: Record<string, string> = {};
  for (const c of cats) {
    const r = await prisma.serviceCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
    C[c.slug] = r.id;
    console.log(`   ✅ ${c.name}`);
  }
  console.log("");

  // ══════════════════════════════════════
  // 3. المناطق والمدن
  // ══════════════════════════════════════
  console.log("🗺️  إنشاء المناطق والمدن...");
  const regionsRaw = [
    { name: "الرياض",           slug: "riyadh",  order: 1, cities: [{ name: "الرياض",      slug: "riyadh-city" },{ name: "الخرج",    slug: "al-kharj" },{ name: "المزاحمية", slug: "al-muzahimiyah" },{ name: "الدرعية",  slug: "diriyah" }] },
    { name: "القصيم",           slug: "qassim",  order: 2, cities: [{ name: "بريدة",        slug: "buraidah" },  { name: "عنيزة",    slug: "unaizah" },  { name: "الرس",      slug: "al-rass" },        { name: "البكيرية", slug: "al-bukayriyah" }] },
    { name: "المنطقة الشرقية", slug: "eastern", order: 3, cities: [{ name: "الدمام",        slug: "dammam" },    { name: "الخبر",    slug: "al-khobar" },{ name: "الأحساء",   slug: "al-ahsa" },        { name: "القطيف",   slug: "qatif" }] },
    { name: "جدة",              slug: "jeddah",  order: 4, cities: [{ name: "جدة",           slug: "jeddah-city" },{ name: "رابغ",    slug: "rabigh" },   { name: "الليث",     slug: "al-lith" },        { name: "القنفذة",  slug: "al-qunfudhah" }] },
    { name: "أبها",             slug: "abha",    order: 5, cities: [{ name: "أبها",          slug: "abha-city" }, { name: "خميس مشيط", slug: "khamis-mushait" }, { name: "النماص", slug: "al-namas" }, { name: "بيشة", slug: "bisha" }] },
  ];
  const R: Record<string, string> = {};
  const K: Record<string, string> = {};
  for (const rd of regionsRaw) {
    const { cities: cityList, ...rInfo } = rd;
    const reg = await prisma.region.upsert({ where: { slug: rInfo.slug }, update: {}, create: rInfo });
    R[rInfo.slug] = reg.id;
    for (const cd of cityList) {
      const city = await prisma.city.upsert({ where: { slug: cd.slug }, update: {}, create: { ...cd, regionId: reg.id } });
      K[cd.slug] = city.id;
    }
    console.log(`   ✅ ${rInfo.name}`);
  }
  console.log("");

  // ══════════════════════════════════════
  // 4. المستخدمون (12 مستخدم — تسلسلي)
  // ══════════════════════════════════════
  console.log("👥 إنشاء المستخدمين...");
  const admin = await prisma.user.upsert({
    where: { phone: "0500000000" }, update: {},
    create: { name: "مدير المنصة", username: "admin", phone: "0500000000", email: "admin@khadamat.sa", role: "ADMIN", isVerified: true, city: "الرياض", bio: "مدير منصة الخدمات السعودية", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=admin&backgroundColor=1E3A5F" },
  });
  const u1 = await prisma.user.upsert({
    where: { phone: "0501111111" }, update: {},
    create: { name: "أحمد العمري", username: "ahmed_omari", phone: "0501111111", email: "ahmed@example.com", role: "USER", isVerified: true, city: "الرياض", bio: "محامٍ متخصص في القضايا التجارية مع خبرة 10 سنوات", rating: 4.8, totalRatings: 24, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ahmed&backgroundColor=6366F1" },
  });
  const u2 = await prisma.user.upsert({
    where: { phone: "0502222222" }, update: {},
    create: { name: "سارة الزهراني", username: "sara_zahrani", phone: "0502222222", email: "sara@example.com", role: "USER", isVerified: true, city: "جدة", bio: "مستشارة عقارية معتمدة - متخصصة في عقارات جدة", rating: 4.6, totalRatings: 18, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=sara&backgroundColor=EC4899" },
  });
  const u3 = await prisma.user.upsert({
    where: { phone: "0503333333" }, update: {},
    create: { name: "محمد القحطاني", username: "mohammed_qahtani", phone: "0503333333", email: "mohammed@example.com", role: "USER", isVerified: true, city: "الدمام", bio: "منظم رحلات ومرشد سياحي معتمد", rating: 4.9, totalRatings: 35, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=mohammed&backgroundColor=F59E0B" },
  });
  const u4 = await prisma.user.upsert({
    where: { phone: "0504444444" }, update: {},
    create: { name: "نورة السعدي", username: "noura_saadi", phone: "0504444444", email: "noura@example.com", role: "USER", isVerified: true, city: "الرياض", bio: "متخصصة في تنظيم الولائم والمناسبات الفاخرة", rating: 4.7, totalRatings: 42, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=noura&backgroundColor=EF4444" },
  });
  const u5 = await prisma.user.upsert({
    where: { phone: "0505555555" }, update: {},
    create: { name: "خالد الشمري", username: "khalid_shamri", phone: "0505555555", email: "khalid@example.com", role: "USER", isVerified: true, city: "بريدة", bio: "مدرب لياقة بدنية معتمد دولياً - 8 سنوات خبرة", rating: 4.5, totalRatings: 29, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=khalid&backgroundColor=10B981" },
  });
  const u6 = await prisma.user.upsert({
    where: { phone: "0506666666" }, update: {},
    create: { name: "فاطمة الحربي", username: "fatima_harbi", phone: "0506666666", email: "fatima@example.com", role: "USER", isVerified: true, city: "أبها", bio: "مدرّسة لغة إنجليزية وتأسيس - خبرة 12 عاماً", rating: 4.9, totalRatings: 51, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=fatima&backgroundColor=0EA5E9" },
  });
  const u7 = await prisma.user.upsert({
    where: { phone: "0507777777" }, update: {},
    create: { name: "عبدالله المطيري", username: "abdullah_mutairi", phone: "0507777777", role: "USER", isVerified: true, city: "الخبر", rating: 0, totalRatings: 0, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=abdullah&backgroundColor=6366F1" },
  });
  const u8 = await prisma.user.upsert({
    where: { phone: "0508888888" }, update: {},
    create: { name: "منى الغامدي", username: "mona_ghamdi", phone: "0508888888", role: "USER", isVerified: true, city: "جدة", rating: 0, totalRatings: 0, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=mona&backgroundColor=EC4899" },
  });
  const u9 = await prisma.user.upsert({
    where: { phone: "0509999999" }, update: {},
    create: { name: "يوسف الدوسري", username: "yousuf_dosari", phone: "0509999999", role: "USER", isVerified: true, city: "الدمام", rating: 4.3, totalRatings: 12, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=yousuf&backgroundColor=F59E0B" },
  });
  const u10 = await prisma.user.upsert({
    where: { phone: "0511111111" }, update: {},
    create: { name: "ريم العتيبي", username: "reem_otaibi", phone: "0511111111", role: "USER", isVerified: true, city: "الرياض", rating: 4.6, totalRatings: 8, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=reem&backgroundColor=10B981" },
  });
  const u11 = await prisma.user.upsert({
    where: { phone: "0512222222" }, update: {},
    create: { name: "سلمان البقمي", username: "salman_buqami", phone: "0512222222", role: "USER", isVerified: true, city: "أبها", rating: 4.8, totalRatings: 15, avatar: "https://api.dicebear.com/7.x/initials/svg?seed=salman&backgroundColor=6366F1" },
  });
  console.log(`   ✅ تم إنشاء 12 مستخدم\n`);

  // ══════════════════════════════════════
  // 5. الخدمات التجريبية (40 خدمة)
  // ══════════════════════════════════════
  console.log("🛠️  إنشاء الخدمات...");

  type Img = { url: string; publicId: string; width: number; height: number; sizeKb: number; order: number };
  type SvcData = { title: string; description: string; tags: string; deliveryTime: string; categorySlug: string; providerId: string; regionSlug: string; citySlug: string; images: Img[]; views: number };

  const img = (seed: string, order: number): Img => ({ url: `https://picsum.photos/seed/${seed}/800/600`, publicId: seed, width: 800, height: 600, sizeKb: 300 + Math.floor(Math.random() * 80), order });

  const svcs: SvcData[] = [
    // استشارات (7)
    { title: "استشارة قانونية في العقود التجارية", description: "أقدم استشارة قانونية متكاملة في مجال العقود التجارية وحماية حقوقك القانونية. خبرة 10 سنوات في المحاكم السعودية. تشمل مراجعة العقد وتحديد نقاط الضعف وتقديم التوصيات.", tags: JSON.stringify(["قانون","عقود","استشارة"]), deliveryTime: "24 ساعة", categorySlug: "consultations", providerId: u1.id, regionSlug: "riyadh", citySlug: "riyadh-city", images: [img("law1",0),img("law2",1),img("law3",2)], views: 245 },
    { title: "متابعة قضايا العمالة والتأشيرات", description: "متخصص في قضايا العمالة ونزاعات العمل وإجراءات التأشيرات. أساعدك في متابعة قضيتك وتقديم الاستشارات اللازمة لإنهائها بأسرع وقت ممكن.", tags: JSON.stringify(["عمالة","تأشيرات","قضايا"]), deliveryTime: "حسب القضية", categorySlug: "consultations", providerId: u1.id, regionSlug: "riyadh", citySlug: "al-kharj", images: [img("work1",0),img("work2",1)], views: 189 },
    { title: "استشارة مالية وإدارة الاستثمارات", description: "استشارة مالية شاملة لمساعدتك في اتخاذ القرارات الاستثمارية الصحيحة. نحلل وضعك المالي ونضع خطة مدروسة لتنمية ثروتك وتحقيق أهدافك المالية.", tags: JSON.stringify(["مالية","استثمار","تخطيط"]), deliveryTime: "جلسة ساعتين", categorySlug: "consultations", providerId: u2.id, regionSlug: "jeddah", citySlug: "jeddah-city", images: [img("fin1",0),img("fin2",1),img("fin3",2)], views: 312 },
    { title: "توثيق عقود البيع والشراء", description: "خدمة توثيق وصياغة عقود البيع والشراء بصورة قانونية سليمة تضمن حقوق جميع الأطراف. نصيغ العقد بدقة ونراجعه مع الطرفين قبل التوقيع.", tags: JSON.stringify(["توثيق","عقود","بيع"]), deliveryTime: "نفس اليوم", categorySlug: "consultations", providerId: u1.id, regionSlug: "eastern", citySlug: "dammam", images: [img("con1",0)], views: 156 },
    { title: "استشارة ضريبية وزكاة الأعمال", description: "خدمة استشارة ضريبية متخصصة تشمل حساب الزكاة وضريبة القيمة المضافة والإقرارات الضريبية لمنشآتك التجارية. نضمن التوافق مع متطلبات هيئة الزكاة.", tags: JSON.stringify(["ضرائب","زكاة","أعمال"]), deliveryTime: "48 ساعة", categorySlug: "consultations", providerId: u1.id, regionSlug: "riyadh", citySlug: "diriyah", images: [img("tax1",0),img("tax2",1)], views: 198 },
    { title: "تأسيس شركات ومؤسسات فردية", description: "أساعدك في تأسيس شركتك أو مؤسستك الفردية بالإجراءات الصحيحة لدى وزارة التجارة والجهات المختصة. خدمة متكاملة من التسجيل حتى الحصول على السجل التجاري.", tags: JSON.stringify(["تأسيس","شركات","تجارة"]), deliveryTime: "أسبوع", categorySlug: "consultations", providerId: u9.id, regionSlug: "eastern", citySlug: "al-khobar", images: [img("biz1",0),img("biz2",1)], views: 256 },
    { title: "متابعة قضايا التحكيم التجاري", description: "خبير في قضايا التحكيم التجاري وفض النزاعات بطرق بديلة عن القضاء. نوفر حلولاً سريعة وفعالة بتكاليف أقل من المحاكم التقليدية.", tags: JSON.stringify(["تحكيم","نزاعات","تجاري"]), deliveryTime: "حسب القضية", categorySlug: "consultations", providerId: u2.id, regionSlug: "jeddah", citySlug: "rabigh", images: [img("arb1",0)], views: 143 },

    // عقارات (6)
    { title: "تقييم عقاري معتمد للعقارات السكنية", description: "تقرير تقييم عقاري معتمد من مقيّم معتمد لدى الهيئة السعودية للمقيّمين. يشمل تحليل السوق والمساحة والموقع والقيمة السوقية العادلة.", tags: JSON.stringify(["تقييم","عقار","مساكن"]), deliveryTime: "3-5 أيام", categorySlug: "real-estate", providerId: u2.id, regionSlug: "jeddah", citySlug: "jeddah-city", images: [img("re1",0),img("re2",1),img("re3",2)], views: 420 },
    { title: "البحث عن شقة مناسبة وتفاوض الإيجار", description: "أبحث لك عن الشقة المناسبة حسب متطلباتك وميزانيتك في جميع أحياء جدة وأتفاوض بالنيابة عنك للحصول على أفضل سعر وشروط إيجار.", tags: JSON.stringify(["إيجار","شقق","تفاوض"]), deliveryTime: "أسبوع", categorySlug: "real-estate", providerId: u2.id, regionSlug: "jeddah", citySlug: "rabigh", images: [img("apt1",0),img("apt2",1)], views: 287 },
    { title: "إدارة العقارات المؤجرة", description: "خدمة إدارة متكاملة للعقارات المؤجرة تشمل تحصيل الإيجار والصيانة الدورية والتعامل مع المستأجرين وتقديم تقارير شهرية.", tags: JSON.stringify(["إدارة","عقار","مستأجرين"]), deliveryTime: "خدمة شهرية", categorySlug: "real-estate", providerId: u2.id, regionSlug: "riyadh", citySlug: "riyadh-city", images: [img("prop1",0),img("prop2",1),img("prop3",2)], views: 198 },
    { title: "تصوير عقاري احترافي للبيع والإيجار", description: "تصوير عقاري احترافي بكاميرات عالية الدقة لعرض عقارك بصورة مميزة وجذابة. تشمل الخدمة جلسة تصوير كاملة وتعديل الصور وجولة 360 درجة.", tags: JSON.stringify(["تصوير","عقار","احترافي"]), deliveryTime: "يوم واحد", categorySlug: "real-estate", providerId: u10.id, regionSlug: "riyadh", citySlug: "riyadh-city", images: [img("photo1",0),img("photo2",1)], views: 312 },
    { title: "تأجير استوديوهات وشقق مؤثثة", description: "وساطة عقارية متخصصة في إيجاد أفضل الاستوديوهات والشقق المؤثثة في المنطقة الشرقية للإيجار اليومي والأسبوعي والشهري.", tags: JSON.stringify(["استوديو","شقق مؤثثة","إيجار قصير"]), deliveryTime: "نفس اليوم", categorySlug: "real-estate", providerId: u3.id, regionSlug: "eastern", citySlug: "al-khobar", images: [img("studio1",0),img("studio2",1),img("studio3",2)], views: 445 },
    { title: "خدمة رهن عقاري واستشارات التمويل", description: "مستشار تمويل عقاري معتمد يساعدك في الحصول على أفضل تمويل عقاري من البنوك السعودية بأقل نسبة فائدة وأيسر الشروط.", tags: JSON.stringify(["رهن","تمويل","بنوك"]), deliveryTime: "أسبوعان", categorySlug: "real-estate", providerId: u2.id, regionSlug: "jeddah", citySlug: "al-lith", images: [img("mortgage1",0),img("mortgage2",1)], views: 267 },

    // سفر (6)
    { title: "تنظيم رحلة عائلية مميزة داخل المملكة", description: "نخطط لك رحلة عائلية مميزة داخل المملكة تشمل اختيار الوجهة وحجز الفنادق وبرنامج يومي متكامل والمواصلات. رحلة لا تُنسى بأقل التكاليف.", tags: JSON.stringify(["رحلات","عائلة","سياحة"]), deliveryTime: "تخطيط خلال يومين", categorySlug: "travel", providerId: u3.id, regionSlug: "eastern", citySlug: "dammam", images: [img("travel1",0),img("travel2",1),img("travel3",2)], views: 534 },
    { title: "جولات سياحية في المواقع التاريخية", description: "جولات سياحية مرشدة في أبرز المواقع التاريخية والأثرية في المنطقة الشرقية. أحكي قصص وتاريخ كل موقع بأسلوب شيق وممتع.", tags: JSON.stringify(["سياحة","تاريخ","جولات"]), deliveryTime: "يوم كامل", categorySlug: "travel", providerId: u3.id, regionSlug: "eastern", citySlug: "al-ahsa", images: [img("tour1",0),img("tour2",1)], views: 367 },
    { title: "تنظيم حفلات وأمسيات ترفيهية", description: "خدمة تنظيم احترافية للحفلات والأمسيات الترفيهية بمختلف أنواعها. نتكفل بالديكور والضيافة والتنسيق الكامل لإنجاح مناسبتك.", tags: JSON.stringify(["حفلات","مناسبات","ترفيه"]), deliveryTime: "حسب المناسبة", categorySlug: "travel", providerId: u3.id, regionSlug: "qassim", citySlug: "buraidah", images: [img("party1",0),img("party2",1),img("party3",2)], views: 289 },
    { title: "رحلة صيفية لأبها والمرتفعات", description: "استمتع بجمال مرتفعات أبها وعسير في رحلة صيفية منظمة. نوفر الإقامة في شاليهات جبلية والمواصلات والجولات السياحية في المناطق الطبيعية الخلابة.", tags: JSON.stringify(["أبها","جبال","صيف"]), deliveryTime: "3-5 أيام", categorySlug: "travel", providerId: u11.id, regionSlug: "abha", citySlug: "abha-city", images: [img("abha1",0),img("abha2",1),img("abha3",2)], views: 789 },
    { title: "تنظيم عمرة وزيارات دينية", description: "خدمة تنظيم عمرة متكاملة تشمل الحجز والمواصلات والإرشاد الديني. نضمن لك تجربة روحانية مريحة ولا تُنسى في البيت الحرام والمدينة المنورة.", tags: JSON.stringify(["عمرة","دينية","مكة"]), deliveryTime: "3-7 أيام", categorySlug: "travel", providerId: u3.id, regionSlug: "riyadh", citySlug: "riyadh-city", images: [img("umrah1",0),img("umrah2",1)], views: 923 },
    { title: "حجوزات فندقية بأفضل الأسعار", description: "أحجز لك أفضل الفنادق في مختلف المدن السعودية والخليجية بأسعار تنافسية. نوفر خيارات متنوعة تناسب جميع الميزانيات من الفنادق الاقتصادية حتى خمسة نجوم.", tags: JSON.stringify(["فنادق","حجوزات","سفر"]), deliveryTime: "نفس اليوم", categorySlug: "travel", providerId: u4.id, regionSlug: "eastern", citySlug: "qatif", images: [img("hotel1",0),img("hotel2",1)], views: 334 },

    // ولائم (6)
    { title: "وليمة عربية أصيلة للمناسبات الكبيرة", description: "وليمة عربية فاخرة بأشهى الأطباق السعودية التقليدية: كبسة ومندي وجريش وحلويات أصيلة. نهتم بكل التفاصيل من الطبخ حتى التقديم والتنظيف.", tags: JSON.stringify(["وليمة","مناسبات","طعام"]), deliveryTime: "حسب التوقيت", categorySlug: "catering", providerId: u4.id, regionSlug: "riyadh", citySlug: "riyadh-city", images: [img("feast1",0),img("feast2",1),img("feast3",2)], views: 612 },
    { title: "تجهيز بوفيه متكامل للشركات والمؤتمرات", description: "بوفيه احترافي متكامل مناسب لاجتماعات الشركات والمؤتمرات. يشمل مشروبات ساخنة وباردة ووجبات خفيفة وحلويات. نضمن التقديم الراقي والنظافة التامة.", tags: JSON.stringify(["بوفيه","شركات","مؤتمرات"]), deliveryTime: "حسب الموعد", categorySlug: "catering", providerId: u4.id, regionSlug: "riyadh", citySlug: "diriyah", images: [img("buffet1",0),img("buffet2",1)], views: 445 },
    { title: "تجهيز مائدة رمضانية فاخرة", description: "مائدة إفطار رمضانية فاخرة مع أشهى الأطباق الرمضانية والسوائل والحلويات الشرقية. نوصل لمنزلك في موعد الإفطار تماماً.", tags: JSON.stringify(["رمضان","إفطار","خاص"]), deliveryTime: "قبل المغرب بساعة", categorySlug: "catering", providerId: u4.id, regionSlug: "jeddah", citySlug: "jeddah-city", images: [img("ramadan1",0),img("ramadan2",1),img("ramadan3",2)], views: 723 },
    { title: "حلويات ومعجنات فاخرة للمناسبات", description: "تشكيلة راقية من الحلويات العربية والغربية والمعجنات الطازجة لمناسباتك الخاصة. نصنع حلويات مخصصة حسب الطلب مع التغليف الفاخر.", tags: JSON.stringify(["حلويات","معجنات","مناسبات"]), deliveryTime: "يومان", categorySlug: "catering", providerId: u4.id, regionSlug: "qassim", citySlug: "buraidah", images: [img("sweets1",0),img("sweets2",1)], views: 512 },
    { title: "خدمة قهوة وضيافة عربية", description: "خدمة قهوة عربية وضيافة أصيلة لمجالسك ومناسباتك. نوفر قهوجية متخصصين وأدوات الضيافة الكاملة من دلال وفناجين وتمر وبخور.", tags: JSON.stringify(["قهوة","ضيافة","عربية"]), deliveryTime: "حسب المناسبة", categorySlug: "catering", providerId: u4.id, regionSlug: "riyadh", citySlug: "al-muzahimiyah", images: [img("coffee1",0),img("coffee2",1),img("coffee3",2)], views: 678 },
    { title: "طبخ منزلي يومي بالاشتراك الشهري", description: "خدمة طبخ منزلي يومي بأسلوب صحي ولذيذ. تشمل وجبة الغداء والعشاء مع التوصيل لمنزلك. قائمة متنوعة يومياً تشمل أطباق سعودية وعالمية.", tags: JSON.stringify(["طبخ","منزلي","يومي"]), deliveryTime: "يومي", categorySlug: "catering", providerId: u11.id, regionSlug: "eastern", citySlug: "al-khobar", images: [img("homecook1",0),img("homecook2",1)], views: 289 },

    // عناية (8)
    { title: "تدريب شخصي للياقة البدنية في منزلك", description: "أتي إلى منزلك لتدريبك على أحدث تمارين اللياقة البدنية مع برنامج غذائي مخصص. مدرب معتمد دولياً بخبرة 8 سنوات في التدريب الشخصي.", tags: JSON.stringify(["لياقة","تدريب","صحة"]), deliveryTime: "ساعة", categorySlug: "wellness", providerId: u5.id, regionSlug: "qassim", citySlug: "buraidah", images: [img("fit1",0),img("fit2",1),img("fit3",2)], views: 398 },
    { title: "جلسة مساج علاجي وإسترخاء", description: "جلسة مساج علاجي احترافية لتخفيف التوتر وآلام الظهر والمفاصل. أستخدم تقنيات متعددة مناسبة لكل حالة مع زيوت عطرية طبيعية.", tags: JSON.stringify(["مساج","علاجي","استرخاء"]), deliveryTime: "ساعة ونصف", categorySlug: "wellness", providerId: u5.id, regionSlug: "qassim", citySlug: "unaizah", images: [img("mas1",0),img("mas2",1)], views: 267 },
    { title: "خدمة العناية بالبشرة والتجميل المنزلي", description: "خدمة تجميل منزلية متكاملة: عناية بالبشرة ومكياج وعلاجات تجميلية. أحضر مستلزمات عالية الجودة وأقدم تجربة سبا منزلية فاخرة.", tags: JSON.stringify(["تجميل","بشرة","سبا"]), deliveryTime: "3 ساعات", categorySlug: "wellness", providerId: u6.id, regionSlug: "abha", citySlug: "abha-city", images: [img("bea1",0),img("bea2",1),img("bea3",2)], views: 334 },
    { title: "برنامج تغذية صحية مخصص", description: "إعداد خطة غذائية متكاملة مخصصة حسب حالتك الصحية وأهدافك. تشمل تحليل الوضع الغذائي وخطة وجبات أسبوعية ومتابعة دورية.", tags: JSON.stringify(["تغذية","صحة","حمية"]), deliveryTime: "خطة أسبوعية", categorySlug: "wellness", providerId: u5.id, regionSlug: "eastern", citySlug: "al-khobar", images: [img("nut1",0),img("nut2",1)], views: 456 },
    { title: "جلسات يوغا وتأمل منزلية", description: "جلسات يوغا وتأمل ذهني متخصصة في منزلك. مدربة معتمدة تساعدك على تحقيق التوازن النفسي والجسدي وتخفيف القلق والتوتر.", tags: JSON.stringify(["يوغا","تأمل","صحة نفسية"]), deliveryTime: "ساعة", categorySlug: "wellness", providerId: u10.id, regionSlug: "abha", citySlug: "khamis-mushait", images: [img("yoga1",0),img("yoga2",1)], views: 423 },
    { title: "علاجات طبيعية بالأعشاب", description: "جلسات علاجية طبيعية باستخدام الأعشاب والزيوت العطرية المعتمدة. تشمل العلاج بالزيوت الطبية والنباتات الطبيعية لتعزيز صحة الجسم.", tags: JSON.stringify(["أعشاب","علاج طبيعي","زيوت"]), deliveryTime: "ساعتان", categorySlug: "wellness", providerId: u6.id, regionSlug: "jeddah", citySlug: "jeddah-city", images: [img("herb1",0),img("herb2",1)], views: 198 },
    { title: "حجامة طبية معتمدة", description: "حجامة طبية على يد متخصص معتمد باستخدام أدوات معقمة ومعتمدة صحياً. فوائد صحية مثبتة علمياً لتنقية الدم وتحسين الدورة الدموية.", tags: JSON.stringify(["حجامة","طب نبوي","علاج"]), deliveryTime: "ساعة", categorySlug: "wellness", providerId: u5.id, regionSlug: "riyadh", citySlug: "riyadh-city", images: [img("cup1",0),img("cup2",1)], views: 567 },
    { title: "مساج استرخاء للسيدات", description: "جلسة مساج متخصصة للسيدات في بيئة آمنة ومريحة. تشمل مساج الظهر والأكتاف والقدمين باستخدام زيوت عطرية فاخرة لإزالة التعب والتوتر.", tags: JSON.stringify(["مساج","سيدات","استرخاء"]), deliveryTime: "ساعتان", categorySlug: "wellness", providerId: u6.id, regionSlug: "eastern", citySlug: "qatif", images: [img("relax1",0),img("relax2",1),img("relax3",2)], views: 345 },

    // تعليم (7)
    { title: "تدريس اللغة الإنجليزية لجميع المستويات", description: "حصص خصوصية في اللغة الإنجليزية لجميع المراحل والبالغين. منهج مبتكر يركز على المحادثة والقواعد معاً. نتائج مضمونة خلال شهر.", tags: JSON.stringify(["إنجليزي","تدريس","خصوصي"]), deliveryTime: "ساعة لكل حصة", categorySlug: "education", providerId: u6.id, regionSlug: "abha", citySlug: "khamis-mushait", images: [img("eng1",0),img("eng2",1),img("eng3",2)], views: 589 },
    { title: "دورة تأسيس الرياضيات والعلوم", description: "دورة تأسيسية مكثفة في الرياضيات والعلوم للمراحل الابتدائية والمتوسطة. أساليب تفاعلية وألعاب تعليمية لتحبيب الطالب في المادة.", tags: JSON.stringify(["رياضيات","علوم","تأسيس"]), deliveryTime: "ساعتان", categorySlug: "education", providerId: u6.id, regionSlug: "abha", citySlug: "al-namas", images: [img("math1",0),img("math2",1)], views: 412 },
    { title: "تدريب على مهارات البرمجة للمبتدئين", description: "تعلم البرمجة من الصفر! دورة شاملة تغطي Python وHTML/CSS وأساسيات JavaScript. مشاريع تطبيقية حقيقية تضيفها لسيرتك الذاتية.", tags: JSON.stringify(["برمجة","تقنية","مبتدئين"]), deliveryTime: "8 أسابيع", categorySlug: "education", providerId: u5.id, regionSlug: "qassim", citySlug: "al-rass", images: [img("code1",0),img("code2",1),img("code3",2)], views: 678 },
    { title: "تحضير IELTS وTOEFL", description: "تحضير مكثف لاختبارات IELTS وTOEFL مع مدربة خبيرة. نركز على جميع المهارات الأربع: القراءة والكتابة والاستماع والتحدث. نتائج مضمونة.", tags: JSON.stringify(["IELTS","TOEFL","لغة إنجليزية"]), deliveryTime: "4-8 أسابيع", categorySlug: "education", providerId: u6.id, regionSlug: "riyadh", citySlug: "riyadh-city", images: [img("ielts1",0),img("ielts2",1)], views: 834 },
    { title: "دروس القرآن الكريم والتجويد", description: "حلقات قرآنية فردية لتعليم القرآن الكريم والتجويد بأسلوب صحيح. للكبار والصغار. الأستاذة حاصلة على إجازة في القراءات العشر.", tags: JSON.stringify(["قرآن","تجويد","حفظ"]), deliveryTime: "30 دقيقة", categorySlug: "education", providerId: u6.id, regionSlug: "qassim", citySlug: "unaizah", images: [img("quran1",0),img("quran2",1)], views: 1123 },
    { title: "تدريب Excel وWord المتقدم", description: "دورة احترافية في برامج Microsoft Office المتقدمة. تشمل Excel للتحليل والجداول والمخططات وWord للتقارير والمستندات الاحترافية.", tags: JSON.stringify(["Excel","Word","Office"]), deliveryTime: "10 ساعات", categorySlug: "education", providerId: u5.id, regionSlug: "eastern", citySlug: "dammam", images: [img("excel1",0),img("excel2",1)], views: 445 },
    { title: "تعليم الخط العربي والزخرفة", description: "تعلم فن الخط العربي والزخرفة الإسلامية من البداية حتى الاحتراف. ندرّس جميع أنواع الخط: النسخ والرقعة والثلث والديواني.", tags: JSON.stringify(["خط عربي","زخرفة","فنون"]), deliveryTime: "ساعة", categorySlug: "education", providerId: u4.id, regionSlug: "abha", citySlug: "bisha", images: [img("calligraphy1",0),img("calligraphy2",1)], views: 234 },
  ];

  const svcIds: string[] = [];
  for (const s of svcs) {
    const { images, categorySlug, regionSlug, citySlug, ...rest } = s;
    const svc = await prisma.service.create({
      data: { ...rest, categoryId: C[categorySlug], regionId: R[regionSlug], cityId: K[citySlug], images: { create: images } },
    });
    svcIds.push(svc.id);
    process.stdout.write(".");
  }
  console.log(`\n   ✅ تم إنشاء ${svcIds.length} خدمة\n`);

  // ══════════════════════════════════════
  // 6. الحجوزات (35 حجز — تسلسلي)
  // ══════════════════════════════════════
  console.log("📋 إنشاء الحجوزات...");

  type BookingInput = { svcIdx: number; clientId: string; notes: string; status: string; paymentStatus: string; canRate: boolean; paymentRef?: string };
  const bookingsList: BookingInput[] = [
    // مكتملة ومدفوعة (25 حجز)
    { svcIdx: 0,  clientId: u7.id,    notes: "أحتاج الاستشارة قبل توقيع العقد",      status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-001" },
    { svcIdx: 7,  clientId: admin.id, notes: "رحلة عائلية 5 أفراد لـ 3 أيام",        status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-002" },
    { svcIdx: 13, clientId: u7.id,    notes: "وليمة غداء لـ 50 شخص",                 status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-003" },
    { svcIdx: 4,  clientId: u8.id,    notes: "استشارة ضريبية لمؤسستي",                status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-004" },
    { svcIdx: 20, clientId: admin.id, notes: "جلسة لياقة أسبوعية",                    status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-005" },
    { svcIdx: 29, clientId: u7.id,    notes: "دروس إنجليزي للمحادثة",                 status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-006" },
    { svcIdx: 6,  clientId: u8.id,    notes: "متابعة قضية تحكيم",                     status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-007" },
    { svcIdx: 10, clientId: admin.id, notes: "تقييم فيلا سكنية في حي النزهة",          status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-008" },
    { svcIdx: 17, clientId: u7.id,    notes: "بوفيه اجتماع مجلس الإدارة",              status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-009" },
    { svcIdx: 25, clientId: u8.id,    notes: "مساج علاجي للظهر",                      status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-010" },
    { svcIdx: 33, clientId: admin.id, notes: "دورة Excel للتقارير",                    status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-011" },
    { svcIdx: 2,  clientId: u7.id,    notes: "خطة استثمارية 5 سنوات",                 status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-012" },
    { svcIdx: 15, clientId: u8.id,    notes: "جولة في الأحساء",                        status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-013" },
    { svcIdx: 19, clientId: admin.id, notes: "مائدة رمضانية لـ 8 أفراد",               status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-014" },
    { svcIdx: 26, clientId: u7.id,    notes: "جلسة تجميل للعروس",                     status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-015" },
    { svcIdx: 31, clientId: u8.id,    notes: "تحضير IELTS - مستوى 7",                  status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-016" },
    { svcIdx: 3,  clientId: admin.id, notes: "توثيق عقد شراء شقة",                    status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-017" },
    { svcIdx: 12, clientId: u7.id,    notes: "إدارة عقاري في حي الملقا",               status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-018" },
    { svcIdx: 21, clientId: u8.id,    notes: "حجوزات فندق في المدينة",                 status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-019" },
    { svcIdx: 22, clientId: admin.id, notes: "وليمة عرس لـ 200 شخص",                   status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-020" },
    { svcIdx: 27, clientId: u7.id,    notes: "برنامج تغذية خسارة وزن",                 status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-021" },
    { svcIdx: 30, clientId: u8.id,    notes: "تأسيس رياضيات الابتدائي",                status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-022" },
    { svcIdx: 5,  clientId: admin.id, notes: "تأسيس شركة تقنية",                       status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-023" },
    { svcIdx: 14, clientId: u7.id,    notes: "رحلة عمرة للعائلة",                      status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-024" },
    { svcIdx: 34, clientId: u8.id,    notes: "دروس قرآن يومية",                        status: "COMPLETED", paymentStatus: "PAID", canRate: true,  paymentRef: "PAY-025" },
    // مكتملة بانتظار الدفع (4)
    { svcIdx: 1,  clientId: u8.id,    notes: "متابعة قضية عمالية",                     status: "COMPLETED", paymentStatus: "PENDING", canRate: false },
    { svcIdx: 9,  clientId: u7.id,    notes: "بحث شقة في الرياض",                      status: "COMPLETED", paymentStatus: "PENDING", canRate: false },
    { svcIdx: 28, clientId: admin.id, notes: "جلسة يوغا أسبوعية",                      status: "COMPLETED", paymentStatus: "PENDING", canRate: false },
    { svcIdx: 11, clientId: u8.id,    notes: "تصوير شقة للإيجار",                      status: "COMPLETED", paymentStatus: "PENDING", canRate: false },
    // مؤكدة (3)
    { svcIdx: 16, clientId: admin.id, notes: "حفلة تخرج 100 شخص",                      status: "CONFIRMED", paymentStatus: "PENDING", canRate: false },
    { svcIdx: 24, clientId: u7.id,    notes: "قهوة لحفل الاستقبال",                    status: "CONFIRMED", paymentStatus: "PENDING", canRate: false },
    { svcIdx: 35, clientId: u8.id,    notes: "تدريب برمجة 3 أشهر",                     status: "CONFIRMED", paymentStatus: "PENDING", canRate: false },
    // قيد الانتظار (3)
    { svcIdx: 36, clientId: admin.id, notes: "تعلم خط الثلث",                          status: "PENDING",   paymentStatus: "PENDING", canRate: false },
    { svcIdx: 8,  clientId: u7.id,    notes: "رحلة أبها في الصيف",                     status: "PENDING",   paymentStatus: "PENDING", canRate: false },
    { svcIdx: 23, clientId: u8.id,    notes: "طبخ شهري لعائلة 6 أفراد",                status: "PENDING",   paymentStatus: "PENDING", canRate: false },
  ];

  const ratingComments = [
    "ممتاز جداً، أنصح الجميع بالتواصل معه. خدمة احترافية ولا تُنسى.",
    "تجربة رائعة! سأتعامل معه مرة أخرى بالتأكيد.",
    "خدمة جيدة جداً، استجابة سريعة وتعامل راقي.",
    "محترف وأمين في عمله. النتائج فاقت توقعاتي.",
    "أفضل من تعاملت معه في هذا المجال. شكراً جزيلاً!",
    "خدمة ممتازة وسعر مناسب. سأعود للاستفادة مجدداً.",
    "تعامل راقي وعمل دقيق. أنصح به بشدة.",
  ];

  const ratings = [5,5,4,5,4,5,5,4,5,5,4,5,5,4,5,5,4,5,4,5,5,4,5,5,4];
  const bookingIds: string[] = [];

  for (let i = 0; i < bookingsList.length; i++) {
    const b = bookingsList[i];
    const safeIdx = Math.min(b.svcIdx, svcIds.length - 1);
    const booking = await prisma.booking.create({
      data: {
        status: b.status,
        paymentStatus: b.paymentStatus,
        canRate: b.canRate,
        serviceFee: 50,
        notes: b.notes,
        serviceId: svcIds[safeIdx],
        clientId: b.clientId,
        paymentRef: b.paymentRef || null,
      },
    });
    bookingIds.push(booking.id);

    // إضافة تقييم للحجوزات المكتملة والمدفوعة
    if (b.status === "COMPLETED" && b.paymentStatus === "PAID" && i < 25) {
      const svc = svcs[safeIdx];
      await prisma.rating.create({
        data: {
          score: ratings[i] || 5,
          comment: ratingComments[i % ratingComments.length],
          bookingId: booking.id,
          raterId: b.clientId,
          providerId: svc.providerId,
          serviceId: svcIds[safeIdx],
        },
      });
    }
    process.stdout.write(".");
  }
  console.log(`\n   ✅ تم إنشاء ${bookingsList.length} حجز (25 مدفوع + تقييم)\n`);

  // تحديث تقييمات المزودين
  await prisma.user.update({ where: { id: u1.id }, data: { rating: 4.9, totalRatings: 28 } });
  await prisma.user.update({ where: { id: u2.id }, data: { rating: 4.7, totalRatings: 22 } });
  await prisma.user.update({ where: { id: u3.id }, data: { rating: 4.8, totalRatings: 39 } });
  await prisma.user.update({ where: { id: u4.id }, data: { rating: 4.6, totalRatings: 47 } });
  await prisma.user.update({ where: { id: u5.id }, data: { rating: 4.7, totalRatings: 34 } });
  await prisma.user.update({ where: { id: u6.id }, data: { rating: 4.9, totalRatings: 58 } });

  console.log("══════════════════════════════════════════════════════");
  console.log("✅  اكتمل زرع البيانات التجريبية بنجاح!");
  console.log("══════════════════════════════════════════════════════");
  console.log(`\n📊 الملخص:`);
  console.log(`   • التصنيفات: 6`);
  console.log(`   • المناطق: 5 (20 مدينة)`);
  console.log(`   • المستخدمون: 12 (بما فيهم المدير)`);
  console.log(`   • الخدمات: ${svcIds.length}`);
  console.log(`   • الحجوزات: ${bookingsList.length} (إيرادات: ${25 * 50} ريال)`);
  console.log(`\n🔑 حساب المدير:`);
  console.log(`   الجوال: 0500000000 — الدور: ADMIN\n`);
}

main()
  .catch((e) => { console.error("\n❌ خطأ:", e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
