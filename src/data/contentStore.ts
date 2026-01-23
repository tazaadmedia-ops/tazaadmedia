export interface Author {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    role: string;
    socials: {
        twitter?: string;
        mastodon?: string;
    };
}

export interface Article {
    id: string;
    title: string;
    subdeck?: string;
    image?: string;
    tag?: string;
    author: string;
    authorId: string;
    content?: string;
    status: 'draft' | 'published' | 'scheduled';
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    publishedAt?: string;
}

export const AUTHORS: Author[] = [
    {
        id: 'michael-scherer',
        name: 'مائيڪل شيرر',
        avatar: 'https://placehold.co/200x200/444/fff?text=MS',
        bio: 'مائيڪل شيرر تازاد جو اسٽاف رائيٽر آهي. هن اڳ ۾ واشنگٽن پوسٽ ۾ قومي سياسي رپورٽر طور ڪم ڪيو آهي ۽ ٽائم ميگزين جو واشنگٽن بيورو چيف پڻ رهيو آهي.',
        role: 'اسٽاف رائيٽر',
        socials: { twitter: '@scherer' }
    },
    {
        id: 'shah-muhammad',
        name: 'شاهه محمد',
        avatar: 'https://placehold.co/200x200/222/fff?text=SM',
        bio: 'شاهه محمد هڪ تجرباتي صحافي آهي جيڪو سياسي ۽ سماجي معاملن تي گهري نظر رکي ٿو. هن جا تجزيا سنڌي صحافت ۾ انتهائي اهم سمجهيا وڃن ٿا.',
        role: 'سينئر رپورٽر',
        socials: { twitter: '@shahmohammad' }
    },
    {
        id: 'bbc-news',
        name: 'بي بي سي نيوز',
        avatar: 'https://placehold.co/200x200/b80000/fff?text=BBC',
        bio: 'دنيا جي معتبر ترين خبرن جي اداري بي بي سي پاران عالمي معاملن تي خاص رپورٽون.',
        role: 'نيوز پارٽنر',
        socials: {}
    }
];

export const HERO_STORY: Article = {
    id: 'russia-ukraine-talks',
    title: "لائيو: روس، آمريڪا ۽ يوڪرين جي وچ ۾ ڳالهيون اڄ متحده عرب امارات ۾ ٿينديون، 'ٽرمپ سان ملاقات انتهائي اهم ۽ مثبت رهي': زيليسڪي",
    subdeck: "ڊيووس ۾ ورلڊ اڪنامڪ فورم کان يوڪرين جي صدر ولاديمير زيليسڪي پنهنجي خطاب ۾ آمريڪي صدر ڊونلڊ ٽرمپ سان خميس تي پنهنجي ملاقات کي 'انتهائي اهم' ۽ مثبت قرار ڏنو. هن چيو ته امن جي حاصلات لاءِ آمريڪا جو 'ڪردار مضبوط' هجڻ ضروري آهي.",
    image: "https://placehold.co/800x500/111/fff?text=Trump+Zelensky",
    tag: "لائيو",
    author: "بي بي سي نيوز",
    authorId: 'bbc-news',
    status: 'published',
    slug: 'russia-ukraine-talks',
};

export const SIDE_GRID_STORIES: Article[] = [
    {
        id: 'pakistan-trump-board',
        title: "پاڪستان ٽرمپ جي 'بور آف پيس' ۾ شامل: رڪن ملڪن کي ڪهڙا اختيار حاصل هوندا؟",
        image: "https://placehold.co/400x250/222/fff?text=Pakistan+Trump",
        tag: "پاليسي",
        author: "شاهه محمد",
        authorId: 'shah-muhammad',
        status: 'published',
        slug: 'pakistan-trump-board',
    },
    {
        id: 'auto-industry',
        title: "هر سال لکين ڪارون تيار ڪرڻ وارو هي ننڍڙو ملڪ آٽو انڊسٽري جو وڏو رانديگر ڪيئن بڻيو؟",
        image: "https://placehold.co/400x250/333/fff?text=Car+Industry",
        tag: "اڪنامڪس",
        author: "عبدالغفور",
        authorId: 'shah-muhammad',
        status: 'published',
        slug: 'auto-industry',
    },
    {
        id: 'lahore-lion',
        title: "لاهور ۾ لوڊر رڪشا تي 'سوار' شينهن جي حملي ۾ ٻارڙي زخمي، پوليس وڌيڪ 10 شينهن هٿ ڪري ورتا",
        image: "https://placehold.co/400x250/444/fff?text=Lion+Rickshaw",
        tag: "مقامي",
        author: "احمد رضا",
        authorId: 'shah-muhammad',
        status: 'published',
        slug: 'lahore-lion',
    },
    {
        id: 'india-priest',
        title: "انڊيا ۾ پادري کي تشدد ڪرڻ جي الزام ۾ چار فرد زير حراست: 'مندر اڳيان سجده ڪرڻ ۽ شعري رام جا نعرا هڻڻ تي مجبور ڪيو ويو'",
        image: "https://placehold.co/400x250/555/fff?text=Priest",
        tag: "انٽرنيشنل",
        author: "زاهد ايس",
        authorId: 'shah-muhammad',
        status: 'published',
        slug: 'india-priest',
    }
];

export const BOTTOM_TEXT_STORIES: Article[] = [
    {
        id: 'trump-europe',
        title: "ٽرمپ جي ضد، نوان اصول ۽ يورپ جو خوف: آمريڪي صدر طاقت جي زور تي ورلڊ آرڊر ڪيئن بدلائي رهيو آهي",
        tag: "آمريڪا",
        author: "سلمان خان",
        authorId: 'michael-scherer',
        status: 'published',
        slug: 'trump-europe',
    },
    {
        id: 't20-world-cup',
        title: "ٽي 20 ورلڊ ڪپ: آئي سي سي جي فيصلي باوجود بنگلاديش جو انڊيا ۾ ميچون کيڏڻ کان انڪار",
        tag: "رانديون",
        author: "ياسر شاهه",
        authorId: 'michael-scherer',
        status: 'published',
        slug: 't20-world-cup',
    },
    {
        id: 'ocean-control',
        title: "'سمنڊن تي ڪنٽرول جي خواهش': اربين ڊالر جي تجارت يقيني بڻائڻ وارا اهم بحري گذرگاهه سعودي عرب ۽ امارات جي وچ ۾ رقابت جو ميدان ڪيئن بڻيا؟",
        tag: "تجارت",
        author: "ساجد علي",
        authorId: 'michael-scherer',
        status: 'published',
        slug: 'ocean-control',
    },
    {
        id: 'dream-industry',
        title: "دنيا ۾ مقبول هم جنس پرست عورتن جي محبت تي ٻڌل ڊرامي ڪس طرح ڪروڙين ڊالر جي منافعي بخش صنعت بڻي",
        tag: "صحافت",
        author: "ناديه خان",
        authorId: 'michael-scherer',
        status: 'published',
        slug: 'dream-industry',
    }
];

export const FEATURE_STORIES: Article[] = [
    {
        id: 'punjab-uni-fee',
        title: "لاهور جي پنجاب يونيورسٽي ۾ داخل ٿيڻ لاءِ 30 روپيه انٽري فيس ڇو لاڳو ڪئي وئي؟",
        image: "https://placehold.co/400x225/111/fff?text=Punjab+Uni",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'punjab-uni-fee',
    },
    {
        id: 'balochistan-law',
        title: "بلوچستان ۾ حراستي مرڪزن جي قانون تي تنقيد: 'هن ۾ انصاف جو عنصر غائب آهي، نه جج هوندو نه گواهہ'",
        image: "https://placehold.co/400x225/222/fff?text=Balochistan",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'balochistan-law',
    },
    {
        id: 'handshake-forgotten',
        title: "'هينڊ شيڪ وساري وياسين، لڳي ٿو پاڙيسرين وٽ ويا هئا': پاڪستان-آسٽريليا ٽي ٽوئنٽي سيريز جو پرومو بحث هيٺ",
        image: "https://placehold.co/400x225/333/fff?text=Pakistan+vs+Aus",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'handshake-forgotten',
    },
    {
        id: 'royal-weddings',
        title: "ٻن شاهي شادين جي وچ ۾ عبدالله ديواڻي: هڪ منفرد داستان",
        image: "https://placehold.co/400x225/444/fff?text=Royal+Weddings",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'royal-weddings',
    }
];

export const SPECIAL_REPORT_STORIES: Article[] = [
    {
        id: 'sc-release',
        title: "'2500 روپين جو جهيڙو': قتل جي ڪيس ۾ عمر قيد ماڻيندڙ شخص کي سپريم ڪورٽ 15 سالن بعد بيگناهه ڇو قرار ڏنو؟",
        image: "https://placehold.co/400x225/555/fff?text=Supreme+Court",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'sc-release',
    },
    {
        id: 'gul-plaza-survivor',
        title: "گل پلازا ۾ باهه لڳڻ بعد گم ٿيل ماڻهن جي خاندانن جو درد: 'ڀائٽين کي ڇا چوان ته سندن پيءُ گهر ڇو نه آيو؟'",
        image: "https://placehold.co/400x225/666/fff?text=Gul+Plaza",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'gul-plaza-survivor',
    },
    {
        id: 'penny-stocks',
        title: "'وڏي منافعي جون ناقابل يقين ڪهاڻيون': پني اسٽاڪس ڇا آهن ۽ پاڪستاني اسٽاڪ مارڪيٽ ۾ نوان سيڙپڪار ڪيئن ڦاسي پون ٿا؟",
        image: "https://placehold.co/400x225/777/fff?text=Stock+Market",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'penny-stocks',
    },
    {
        id: 'kino-export',
        title: "ڪينو جي ڪوالٽي يا پاڪ-افغان سرحد جي بندش: پاڪستاني برآمدات ۾ گهٽتائي جو اصل ڪارڻ ڪهڙو آهي؟",
        image: "https://placehold.co/400x225/888/fff?text=Kino+Export",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'kino-export',
    }
];

export const PAKISTAN_STORIES: Article[] = [
    {
        id: 'mobile-custom',
        title: "استعمال ٿيل موبائل فونز جي ڪسٽم ويليو ۾ گهٽتائي بعد هاڻي فون رجسٽر ڪرائڻ تي ڪيتري ٽيڪس هوندي؟",
        image: "https://placehold.co/400x225/999/fff?text=Mobile+Tax",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'mobile-custom',
    },
    {
        id: 'pak-trump-peace',
        title: "پاڪستان آمريڪي صدر ڊونلڊ ٽرمپ جي دعوت تي غزه 'بورڊ آف پيس' ۾ شموليت جو فيصلو ڪري ورتو",
        image: "https://placehold.co/400x225/aaa/fff?text=Trump+Pak",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'pak-trump-peace',
    },
    {
        id: 'gul-plaza-search',
        title: "گل پلازا باهه لڳڻ جي چار ڏينهن بعد به سرچ آپريشن جاري: هڪ ئي دڪان مان ڪيترائي سڙيل لاش هٿ، سڃاڻپ لاءِ اسپتال منتقل",
        image: "https://placehold.co/400x225/bbb/fff?text=Gul+Plaza+Search",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'gul-plaza-search',
    },
    {
        id: 'slow-internet-5g',
        title: "ڇا پاڪستان ۾ 'سست انٽرنيٽ' جو حل 5G ٽيڪنالاجي ۾ لڪيل آهي؟",
        image: "https://placehold.co/400x225/ccc/fff?text=5G+Internet",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'slow-internet-5g',
    }
];

export const NEARBY_STORIES: Article[] = [
    {
        id: 'palak-paneer',
        title: "پالڪ پنير جي 'تيز بوءِ' تي اعتراض: آمريڪي يونيورسٽي جي انڊين شاگرد کي ٻه لک ڊالر جي ادائيگي ڪئي وئي",
        image: "https://placehold.co/400x225/ddd/fff?text=Palak+Paneer",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'palak-paneer',
    },
    {
        id: 'iran-protest-verify',
        title: "رت سان ڀريل چهرا ۽ ناقابل سڃاڻپ لاش: ايران ۾ مارجي ويل سوين مظاهرين جي تصويرن ۾ بي بي سي ڇا ڏٺو؟",
        image: "https://placehold.co/400x225/eee/fff?text=Iran+Protest",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'iran-protest-verify',
    },
    {
        id: 'india-uae-defense',
        title: "ڇا انڊيا، متحده عرب امارات ۾ دفاعي شراڪتداري جو اعلان پاڪستان ۽ سعودي عرب جي معاهدي جو جواب آهي؟",
        image: "https://placehold.co/400x225/f1f1f1/333?text=India+UAE",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'india-uae-defense',
    },
    {
        id: 'trump-iran-action',
        title: "صدر ٽرمپ ايران جي خلاف فوجي ڪارروائي ڪرڻ جي معاملي تي پنهنجي قدمن تان پٺيان ڇو هٽي ويو؟",
        image: "https://placehold.co/400x225/121212/fff?text=Trump+Iran",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'trump-iran-action',
    }
];

export const WORLD_STORIES: Article[] = [
    {
        id: 'gold-price-pak',
        title: "پاڪستان ۾ في تولو سون 5 لک روپين کان به مٿي ٿي ويو: سون جي قيمتن ۾ واڌ جو عالمي رجحان ڪڏهن تائين برقرار رهندو؟",
        image: "https://placehold.co/400x225/ffd700/333?text=Gold+Price",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'gold-price-pak',
    },
    {
        id: 'russian-nuclear-briefcase',
        title: "اهو لمحو جڏهن روسي صدر جوهري هٿيار فعال ڪرڻ وارو 'بريف ڪيس' کولي ورتو هو",
        image: "https://placehold.co/400x225/b22222/fff?text=Nuclear+Briefcase",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'russian-nuclear-briefcase',
    },
    {
        id: 'global-tension-russia',
        title: "عالمي سطح تي ڇڪتاڻ کي جنم ڏيڻ وارو اهو تڪرار جنهن روس کي اوجيت صدر ٽرمپ جي 'قريب' آڻي ڇڏيو آهي",
        image: "https://placehold.co/400x225/000080/fff?text=Russia+Trump",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'global-tension-russia',
    },
    {
        id: 'minor-marriage-mosque',
        title: "گهٽ عمر جوڙي جو غير قانوني نڪاح پڙهائڻ جي الزام ۾ مسجد جي امام کي ساڍا ٽي مهينا قيد جي سزا",
        image: "https://placehold.co/400x225/2f4f4f/fff?text=Mosque+Punishment",
        author: "بي بي سي سنڌي",
        authorId: 'bbc-news',
        status: 'published',
        slug: 'minor-marriage-mosque',
    }
];

// Helper to get article by ID across all collections
export const getArticleById = (id: string): Article | undefined => {
    const all = [
        HERO_STORY,
        ...SIDE_GRID_STORIES,
        ...BOTTOM_TEXT_STORIES,
        ...FEATURE_STORIES,
        ...SPECIAL_REPORT_STORIES,
        ...PAKISTAN_STORIES,
        ...NEARBY_STORIES,
        ...WORLD_STORIES
    ];
    const found = all.find(a => a.id === id);
    if (found && id === 'russia-ukraine-talks') {
        found.content = `
            <p className="dropcap">ڊيووس ۾ ورلڊ اڪنامڪ فورم کان يوڪرين جي صدر ولاديمير زيليسڪي پنهنجي خطاب ۾ آمريڪي صدر ڊونلڊ ٽرمپ سان خميس تي پنهنجي ملاقات کي 'انتهائي اهم' ۽ مثبت قرار ڏنو. هن چيو ته امن جي حاصلات لاءِ آمريڪا جو 'ڪردار مضبوط' هجڻ ضروري آهي.</p>
            <p>روس ۽ يوڪرين جي وچ ۾ جاري ڇڪتاڻ کي گهٽائڻ لاءِ عالمي قوتون متحرڪ آهن. متحده عرب امارات جي ميزباني ۾ ٿيندڙ اهي ڳالهيون خطي ۾ امن جي نئين اميد طور ڏٺيون پيون وڃن.</p>
            <h3>امن جي اميد</h3>
            <p>عالمي تجزيه نگارن جو چوڻ آهي ته ٽرمپ جي انتظاميه طرفان کنيل قدم انتهائي حيران ڪندڙ آهن. جيتوڻيڪ ڪجهه يورپي ملڪ ان معاملي تي خدشن جو شڪار آهن، پر زيليسڪي جي مثبت بيان صورتحال کي تبديل ڪري ڇڏيو آهي.</p>
            <blockquote>"امن ڪنهن به معاهدي کان وڌيڪ قيمتي آهي، پر اسان پنهنجي ملڪي سالميت تي سمجهوتو نه ڪنداسين." - زيليسڪي</blockquote>
            <p>ٻئي طرف روسي اختيارين جو چوڻ آهي ته هو ڳالهين لاءِ تيار آهن پر انهن جا پنهنجا شرط آهن جيڪي پورا ڪرڻ ضروري آهن.</p>
        `;
    }
    return found;
};

export const getAuthorById = (id: string): Author | undefined => {
    return AUTHORS.find(a => a.id === id);
};

export const getArticlesByAuthor = (authorId: string): Article[] => {
    const all = [
        HERO_STORY,
        ...SIDE_GRID_STORIES,
        ...BOTTOM_TEXT_STORIES,
        ...FEATURE_STORIES,
        ...SPECIAL_REPORT_STORIES,
        ...PAKISTAN_STORIES,
        ...NEARBY_STORIES,
        ...WORLD_STORIES
    ];
    return all.filter(a => a.authorId === authorId && a.status === 'published');
};
