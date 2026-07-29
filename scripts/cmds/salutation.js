module.exports = {
    config: {
        name: "salutation",
        version: "1.0",
        author: "Veldora Tempest",
        countDown: 2,
        role: 0,
        shortDescription: "Active/désactive la réponse auto aux salutations.",
        longDescription: "Utilisez salutation on, off ou status.",
        category: "système",
        guide: "{pn} [on|off|status]"
    },

    onLoad: function () {
        if (typeof global.salutationEnabled === "undefined") {
            global.salutationEnabled = true;
        }
        if (typeof global.botSalutedUsers === "undefined") {
            global.botSalutedUsers = new Map();
        }
    },

    onChat: async function ({ api, event }) {
        if (!global.salutationEnabled) return;
        if (!event.body || !event.threadID) return;
        if (event.senderID === api.getCurrentUserID()) return;

        const msg = event.body.trim().toLowerCase();
        const uid = event.senderID;
        const threadID = event.threadID;
        const now = Date.now();

        const salutationPatterns = {
            fr: /\b(salut|coucou|bonjour|bonsoir|hey|hello|yo|wesh|bjr|bsr|cc|slt)\b/,
            en: /\b(hi|hello|hey|yo|sup|heya|howdy|good morning|good afternoon|good evening)\b/,
            es: /\b(hola|buenos días|buenas tardes|buenas noches|buenas|saludos|qué tal|qué onda)\b/,
            de: /\b(hallo|hi|guten tag|guten morgen|guten abend|servus|moin|grüß gott|na)\b/,
            pt: /\b(oi|olá|bom dia|boa tarde|boa noite|e aí|opa|beleza)\b/,
            it: /\b(ciao|salve|buongiorno|buonasera|ehi|ei|weila)\b/,
            ru: /\b(привет|здравствуйте|здорова|доброе утро|добрый день|добрый вечер|прив|хай)\b/,
            ar: /\b(سلام|مرحبا|اهلا|هلا|صباح الخير|مساء الخير|السلام عليكم|وعليكم السلام)\b/,
            zh: /\b(你好|您好|嗨|哈喽|早上好|晚上好|下午好|喂)\b/,
            ja: /\b(こんにちは|こんばんは|おはよう|やあ|ちわっす|おっす|どうも)\b/,
            ko: /\b(안녕|안녕하세요|여보세요|좋은 아침|안녕히|하이)\b/,
            hi: /\b(नमस्ते|नमस्कार|हाय|हेलो|सुप्रभात|शुभ संध्या|कैसे हो|क्या हाल है)\b/
        };

        function matchAnyPattern(text, patternsObj) {
            for (const lang in patternsObj) {
                if (patternsObj[lang].test(text)) return lang;
            }
            return null;
        }

        function getRandom(array) {
            return array[Math.floor(Math.random() * array.length)];
        }

        const greetingTypes = ["ca_va", "quoi_de_neuf", "la_forme", "tout_va_bien", "comment_tu_vas"];

        const multiLangGreetings = {
            ca_va: {
                fr: ["Salut ! Comment ça va ?", "Coucou ! Ça va ?", "Bonjour ! Comment ça va aujourd'hui ?", "Hey ! Ça va bien ?"],
                en: ["Hi! How are you?", "Hey! How are you doing?", "Hello! How's it going?", "Yo! How you doing?"],
                es: ["¡Hola! ¿Cómo estás?", "¡Hey! ¿Cómo te va?", "¡Buenas! ¿Cómo andas?", "¡Hola! ¿Qué tal estás?"],
                de: ["Hallo! Wie geht's?", "Hi! Wie geht es dir?", "Servus! Wie geht's dir so?", "Guten Tag! Wie geht es Ihnen?"],
                pt: ["Oi! Como vai?", "Olá! Como você está?", "E aí! Como vai você?", "Oiê! Tudo bem com você?"],
                it: ["Ciao! Come stai?", "Salve! Come sta?", "Ehi! Come stai oggi?", "Buongiorno! Come va?"],
                ru: ["Привет! Как дела?", "Здравствуй! Как ты?", "Хей! Как поживаешь?", "Приветствую! Как самочувствие?"],
                ar: ["سلام! كيف الحال؟", "مرحبا! كيفك؟", "أهلاً! كيف حالك اليوم؟", "السلام عليكم! شلونك؟"],
                zh: ["你好！你怎么样？", "嗨！你还好吗？", "哈喽！你最近怎么样？", "你好呀！今天如何？"],
                ja: ["こんにちは！元気ですか？", "やあ！元気？", "ちわっす！調子どう？", "おはよう！ご機嫌いかが？"],
                ko: ["안녕하세요! 어떻게 지내세요?", "안녕! 잘 지내?", "여보세요! 어떻게 지내요?", "하이! 기분 어때요?"],
                hi: ["नमस्ते! आप कैसे हैं?", "नमस्कार! कैसे हो?", "हाय! क्या हाल है?", "हेलो! आप कैसे हैं?"]
            },
            quoi_de_neuf: {
                fr: ["Salut ! Quoi de neuf ?", "Coucou ! Quoi de neuf depuis tout ce temps ?", "Hey ! Quoi de beau ?", "Bonjour ! Qu'est-ce qui se passe de nouveau ?"],
                en: ["Hi! What's new?", "Hey! What's up?", "Hello! What's going on?", "Yo! What's happening?"],
                es: ["¡Hola! ¿Qué hay de nuevo?", "¡Hey! ¿Qué cuentas?", "¡Buenas! ¿Qué es de tu vida?", "¡Hola! ¿Qué novedades hay?"],
                de: ["Hallo! Was gibt's Neues?", "Hi! Was ist los?", "Servus! Was gibt's Neues bei dir?", "Moin! Was geht ab?"],
                pt: ["Oi! Quais as novidades?", "Olá! O que conta de novo?", "E aí! Novidades?", "Opa! O que tá pegando?"],
                it: ["Ciao! Novità?", "Salve! Cosa c'è di nuovo?", "Ehi! Che si dice?", "Ciao! Cosa racconti di bello?"],
                ru: ["Привет! Что нового?", "Здравствуй! Какие новости?", "Хей! Что слышно?", "Привет! Чё нового?"],
                ar: ["سلام! شو الجديد؟", "مرحبا! شو الأخبار؟", "أهلاً! عندك شي جديد؟", "هلا! شو صاير معك؟"],
                zh: ["你好！有什么新鲜事吗？", "嗨！最近怎么样？", "哈喽！有什么新闻？", "你好呀！最近忙什么呢？"],
                ja: ["こんにちは！何か新しいことある？", "やあ！最近どう？", "ちわっす！変わったことある？", "どうも！近況は？"],
                ko: ["안녕하세요! 새로운 소식 있어요?", "안녕! 요즘 뭐해?", "여보세요! 새로운 일 있어요?", "하이! 근황 어때?"],
                hi: ["नमस्ते! क्या नया है?", "नमस्कार! नया क्या है?", "हाय! क्या चल रहा है?", "हेलो! कुछ नया बताओ?"]
            },
            la_forme: {
                fr: ["Salut ! La forme ?", "Coucou ! En forme aujourd'hui ?", "Hey ! Bien en forme ?", "Bonjour ! La pêche ?"],
                en: ["Hi! You good?", "Hey! Feeling good?", "Hello! In good shape?", "Yo! All good with you?"],
                es: ["¡Hola! ¿Todo bien?", "¡Hey! ¿Con energía?", "¡Buenas! ¿De buen ánimo?", "¡Hola! ¿Estás en forma?"],
                de: ["Hallo! Gut drauf?", "Hi! Fühlst du dich gut?", "Servus! Alles fit?", "Moin! In Form?"],
                pt: ["Oi! Tá bem?", "Olá! Disposto hoje?", "E aí! Tudo em cima?", "Opa! Firmeza?"],
                it: ["Ciao! In forma?", "Salve! Ti senti bene?", "Ehi! Tutto a posto?", "Ciao! Bella lì?"],
                ru: ["Привет! В форме?", "Здравствуй! Бодрый?", "Хей! Как настроение?", "Привет! Полон сил?"],
                ar: ["سلام! معافى؟", "مرحبا! نشيط اليوم؟", "أهلاً! في صحة جيدة؟", "هلا! تمام الصحة؟"],
                zh: ["你好！身体好吗？", "嗨！精神好吗？", "哈喽！状态如何？", "你好呀！有精神吗？"],
                ja: ["こんにちは！元気してる？", "やあ！調子いい？", "ちわっす！絶好調？", "どうも！体調どう？"],
                ko: ["안녕하세요! 컨디션 좋아요?", "안녕! 기분 좋아?", "여보세요! 상태 어때?", "하이! 잘 지내고 있어?"],
                hi: ["नमस्ते! तबीयत ठीक है?", "नमस्कार! फुर्ती से हो?", "हाय! कैसी तबीयत है?", "हेलो! सेहत कैसी है?"]
            },
            tout_va_bien: {
                fr: ["Salut ! Tout va bien ?", "Coucou ! Tout roule ?", "Hey ! Tout baigne ?", "Bonjour ! Tout se passe bien ?"],
                en: ["Hi! Everything okay?", "Hey! All good?", "Hello! Everything fine?", "Yo! Everything alright?"],
                es: ["¡Hola! ¿Todo bien?", "¡Hey! ¿Todo en orden?", "¡Buenas! ¿Todo correcto?", "¡Hola! ¿Todo marcha bien?"],
                de: ["Hallo! Alles klar?", "Hi! Alles okay?", "Servus! Alles in Ordnung?", "Moin! Läuft alles gut?"],
                pt: ["Oi! Tudo bem?", "Olá! Tudo certo?", "E aí! Tudo em ordem?", "Opa! Tudo tranquilo?"],
                it: ["Ciao! Tutto bene?", "Salve! Tutto a posto?", "Ehi! Tutto ok?", "Ciao! Va tutto bene?"],
                ru: ["Привет! Всё в порядке?", "Здравствуй! Всё хорошо?", "Хей! Всё нормально?", "Привет! Всё путём?"],
                ar: ["سلام! كل شيء بخير؟", "مرحبا! كل الأمور تمام؟", "أهلاً! كل شيء ماشي؟", "هلا! أمورك طيبة؟"],
                zh: ["你好！一切都好吗？", "嗨！一切顺利吗？", "哈喽！一切都好？", "你好呀！万事如意吗？"],
                ja: ["こんにちは！万事順調？", "やあ！すべてうまくいってる？", "ちわっす！問題ない？", "どうも！順調？"],
                ko: ["안녕하세요! 다 잘 돼요?", "안녕! 문제 없어?", "여보세요! 모든 게 좋아요?", "하이! 일이 잘 풀려?"],
                hi: ["नमस्ते! सब ठीक है?", "नमस्कार! सब कुछ सही?", "हाय! सब सलामत?", "हेलो! कोई परेशानी तो नहीं?"]
            },
            comment_tu_vas: {
                fr: ["Salut ! Comment tu vas ?", "Coucou ! Comment vas-tu aujourd'hui ?", "Hey ! Alors, comment tu vas ?", "Bonjour ! Dis-moi, comment tu vas ?"],
                en: ["Hi! How's it going?", "Hey! How have you been?", "Hello! How are things?", "Yo! How's life?"],
                es: ["¡Hola! ¿Cómo te va?", "¡Hey! ¿Cómo te ha ido?", "¡Buenas! ¿Cómo va todo?", "¡Hola! ¿Cómo marcha la cosa?"],
                de: ["Hallo! Wie läuft's?", "Hi! Wie steht's?", "Servus! Wie geht's dir heute?", "Moin! Wie schaut's aus?"],
                pt: ["Oi! Como vai você?", "Olá! Como tem passado?", "E aí! Como andam as coisas?", "Opa! Como está a vida?"],
                it: ["Ciao! Come ti va?", "Salve! Come te la passi?", "Ehi! Come vanno le cose?", "Ciao! Come procede?"],
                ru: ["Привет! Как жизнь?", "Здравствуй! Как идут дела?", "Хей! Как ты вообще?", "Привет! Как живётся?"],
                ar: ["سلام! كيف أمورك؟", "مرحبا! شلونك بشكل عام؟", "أهلاً! كيف الدنيا معك؟", "هلا! أخبارك إيه؟"],
                zh: ["你好！你过得怎样？", "嗨！最近过得如何？", "哈喽！生活怎么样？", "你好呀！日子过得怎样？"],
                ja: ["こんにちは！どんな感じ？", "やあ！暮らしはどう？", "ちわっす！人生どう？", "どうも！どんな具合？"],
                ko: ["안녕하세요! 어떻게 지내요?", "안녕! 삶은 어때?", "여보세요! 사는 게 어때?", "하이! 인생은 어때?"],
                hi: ["नमस्ते! ज़िन्दगी कैसी चल रही है?", "नमस्कार! सब कैसा है?", "हाय! जीवन कैसा है?", "हेलो! गुज़र बसर कैसी है?"]
            }
        };

        const responseCategories = {
            bien: {
                fr: /\b(bien|ça va|ca va|super|nickel|cool|tranquille|au top|niquel|parfait|impeccable|génial|magnifique|excellent|top|bien sûr|bien et toi|oui ça va|oui bien|très bien|bien bien)\b/,
                en: /\b(good|fine|great|awesome|amazing|fantastic|wonderful|perfect|excellent|alright|not bad|pretty good|all good|doing well|i'm fine|i'm good|okay|ok|very well|i am fine|i am good)\b/,
                es: /\b(bien|muy bien|genial|excelente|perfecto|estupendo|maravilloso|fenomenal|bien bien|todo bien|súper|bárbaro|de maravilla)\b/,
                de: /\b(gut|sehr gut|super|prima|ausgezeichnet|wunderbar|fantastisch|perfekt|bestens|alles gut|mir geht es gut|klasse|toll)\b/,
                pt: /\b(bem|muito bem|ótimo|excelente|maravilhoso|perfeito|legal|joia|bacana|tudo bem|beleza|show|suave|bem demais)\b/,
                it: /\b(bene|molto bene|benissimo|ottimo|eccellente|meraviglioso|perfetto|fantastico|grandioso|tutto bene|a posto|ok|una favola)\b/,
                ru: /\b(хорошо|отлично|нормально|прекрасно|замечательно|великолепно|супер|класс|круто|всё хорошо|всё отлично|порядок|всё путём)\b/,
                ar: /\b(بخير|الحمد لله|تمام|كويس|ممتاز|رائع|جميل|عظيم|ميه ميه|زي الفل|ما شاء الله|تمام التمام|كله تمام)\b/,
                zh: /\b(很好|不错|挺好的|非常好|很棒|太好了|好极了|完美|优秀|还好|还可以|不错不错|行|好着呢)\b/,
                ja: /\b(元気|げんき|いいよ|最高|さいこう|絶好調|すごくいい|ばっちり|いい感じ|調子いい|いいです|はい元気|うん元気|ええ感じ)\b/,
                ko: /\b(좋아|잘 지내|괜찮아|아주 좋아|최고|완벽해|좋아요|잘 있어|좋습니다|네 좋아요|응 좋아|그럭저럭 좋아)\b/,
                hi: /\b(अच्छा|बढ़िया|ठीक|बहुत अच्छा|शानदार|ज़बरदस्त|कमाल|उत्तम|मस्त|बेहतरीन|सब ठीक|हाँ ठीक|बिल्कुल ठीक)\b/
            },
            mal: {
                fr: /\b(mal|pas bien|bof|moyen|fatigué|triste|déprimé|pas top|pas ouf|pas terrible|ça va pas|dur|compliqué|horrible|affreux|nul|stressé|épuisé|déçu|pas trop|pas super|pas génial|pas très bien|bof bof)\b/,
                en: /\b(bad|not good|sad|tired|depressed|awful|terrible|horrible|not well|not okay|not great|so so|meh|stressed|exhausted|down|upset|miserable|rough|tough|not so good|not really|not at all|kinda bad)\b/,
                es: /\b(mal|no bien|regular|más o menos|fatal|cansado|triste|deprimido|horrible|terrible|estresado|agotado|decepcionado|pésimo|no muy bien|de la patada|para el orto|no tan bien)\b/,
                de: /\b(schlecht|nicht gut|müde|traurig|deprimiert|furchtbar|schrecklich|gestresst|erschöpft|enttäuscht|mies|naja|so lala|bescheiden|nicht so gut|geht so|nicht besonders)\b/,
                pt: /\b(mal|não bem|mais ou menos|cansado|triste|deprimido|horrível|terrível|estressado|esgotado|decepcionado|péssimo|ruim|chato|difícil|não muito bem|nada bem)\b/,
                it: /\b(male|non bene|così così|stanco|triste|depresso|orribile|terribile|stressato|esausto|deluso|pessimo|brutto|difficile|non molto bene|non tanto|non troppo bene|così)\b/,
                ru: /\b(плохо|не очень|так себе|устал|грустно|депрессия|ужасно|кошмар|стресс|вымотан|разочарован|хреново|паршиво|тяжело|неважно|не очень-то|не ахти|бывало и лучше)\b/,
                ar: /\b(مش منيح|تعبان|حزين|مكتئب|سيء|فظيع|مرهق|مضغوط|مخنوق|مش تمام|مش كويس|صعب|خايب|محبط|زفت|مش رايق|مو كويس|شوي تعبان)\b/,
                zh: /\b(不好|不太好|很累|难过|伤心|郁闷|糟糕|很糟|可怕|压力大|筋疲力尽|失望|很差|不怎么好|一般般|坏|不怎么样|不太好说|有点累)\b/,
                ja: /\b(元気じゃない|げんきじゃない|疲れた|つかれた|悲しい|かなしい|最悪|さいあく|ひどい|だめ|ストレス|がっかり|きつい|落ち込んでる|よくない|いまいち|あまり|調子悪い|まあまあ)\b/,
                ko: /\b(안 좋아|못 지내|피곤해|슬퍼|우울해|최악이야|끔찍해|스트레스|지쳤어|실망했어|별로야|힘들어|나빠|그냥 그래|별로|좀 안 좋아|그저 그래)\b/,
                hi: /\b(बुरा|अच्छा नहीं|थका हुआ|उदास|दुखी|बहुत बुरा|भयानक|तनाव|हारा हुआ|निराश|खराब|बेकार|मुश्किल|ठीक नहीं|बस ऐसे ही|कुछ खास नहीं|ज़्यादा अच्छा नहीं)\b/
            },
            rien: {
                fr: /\b(rien|pas grand chose|pas grand-chose|pas beaucoup|tranquille|calme|pas énormément|pas des masses|pas lourd|pas fou|simple|ordinaire)\b/,
                en: /\b(nothing|not much|nothing much|same old|same as usual|not a lot|chilling|just chilling|just the usual|nothing special|the usual|same thing)\b/,
                es: /\b(nada|no mucho|poca cosa|lo de siempre|tranquilo|normal|sin novedad|nada especial|todo igual|lo mismo|lo habitual)\b/,
                de: /\b(nichts|nicht viel|nichts besonderes|wie immer|das Übliche|ruhig|nichts Neues|alles beim Alten|nichts los|wenig)\b/,
                pt: /\b(nada|não muito|pouca coisa|o de sempre|tranquilo|normal|mesma coisa|nada de mais|tudo igual|sem novidades|rotina)\b/,
                it: /\b(niente|non molto|poca cosa|il solito|tranquillo|normale|niente di che|tutto uguale|solita routine|nessuna novità|niente di nuovo)\b/,
                ru: /\b(ничего|не много|ничего особенного|как обычно|всё по-старому|тихо|спокойно|ничего нового|так себе|ничего интересного|обычно)\b/,
                ar: /\b(ولا شي|ما كثير|عادي|زي العادة|مافي جديد|نفس الشي|ولا شي مهم|هادئ|روتين|مافي كثير|ولا حاجة|ما تغير شي)\b/,
                zh: /\b(没什么|没多少|没什么特别的|老样子|一样|和平常一样|没什么新|安静|普通|没啥|就那样|一般)\b/,
                ja: /\b(何も|べつに|特にない|いつも通り|変わらない|普通|平凡|大したことない|なんにも|同じ|たいしたことない)\b/,
                ko: /\b(아무것도|별로|그냥 그래|평소처럼|똑같아|조용해|일상|대단한 거 없어|뭐 없어|특별한 거 없어|그냥)\b/,
                hi: /\b(कुछ नहीं|ज़्यादा नहीं|खास नहीं|हमेशा की तरह|साधारण|शांत|आम|वही|रोज़ जैसा|कुछ खास नहीं|बस ऐसे ही|सामान्य)\b/
            }
        };

        const multiLangPositiveResponses = {
            ca_va: {
                fr: ["Tant mieux ! Passe une excellente journée. 🌟", "Super ! Profite bien de ta journée. 😊", "Content de l'entendre ! Bonne continuation. ✨", "Parfait ! Prends soin de toi. 💫"],
                en: ["Glad to hear that! Have a wonderful day. 😊", "Awesome! Enjoy your day. 🌟", "Great! Take care of yourself. ✨", "Perfect! Have a fantastic one. 💫"],
                es: ["¡Qué bueno! Que tengas un excelente día. 🌞", "¡Genial! Disfruta tu día. 🌟", "¡Perfecto! Cuídate mucho. ✨", "¡Maravilloso! Que todo siga bien. 💫"],
                de: ["Freut mich! Einen schönen Tag noch. 🌻", "Super! Genieß den Tag. 🌟", "Wunderbar! Pass auf dich auf. ✨", "Klasse! Hab einen tollen Tag. 💫"],
                pt: ["Que bom! Tenha um ótimo dia. 🌴", "Massa! Aproveite o dia. 🌟", "Excelente! Se cuida. ✨", "Perfeito! Tudo de bom. 💫"],
                it: ["Che bello! Buona giornata. 🌈", "Ottimo! Goditi la giornata. 🌟", "Fantastico! Stammi bene. ✨", "Perfetto! Abbi cura di te. 💫"],
                ru: ["Отлично! Хорошего дня. ☀️", "Супер! Наслаждайся днём. 🌟", "Прекрасно! Береги себя. ✨", "Замечательно! Всего хорошего. 💫"],
                ar: ["الحمد لله! يومك سعيد. 🌸", "ممتاز! استمتع بيومك. 🌟", "رائع! خلي بالك على حالك. ✨", "جميل! ربنا يوفقك. 💫"],
                zh: ["太好了！祝你有美好的一天。🌻", "真棒！享受你的一天。🌟", "非常好！保重。✨", "完美！一切顺利。💫"],
                ja: ["良かった！良い一日を。🌸", "最高！楽しんでね。🌟", "素晴らしい！お元気で。✨", "完璧！素敵な一日を。💫"],
                ko: ["다행이야! 좋은 하루 보내. 🌞", "최고야! 즐거운 하루 돼. 🌟", "완벽해! 잘 지내. ✨", "아주 좋아! 행복하길. 💫"],
                hi: ["बढ़िया! आपका दिन शुभ हो। 🌼", "शानदार! दिन का आनंद लो। 🌟", "कमाल! ख्याल रखना। ✨", "बेहतरीन! खुश रहो। 💫"]
            },
            quoi_de_neuf: {
                fr: ["D'accord ! Profite bien quand même. 🌟", "Ok ! Passe une excellente journée. 😊", "Compris ! Prends soin de toi. ✨", "Pas de souci ! Bonne continuation. 💫"],
                en: ["Alright! Have a great day anyway. 🌟", "Okay! Enjoy your day. 😊", "Got it! Take care. ✨", "No worries! Have a good one. 💫"],
                es: ["¡De acuerdo! Que tengas un buen día. 🌞", "¡Ok! Disfruta tu día. 🌟", "¡Entendido! Cuídate. ✨", "¡Tranquilo! Que te vaya bien. 💫"],
                de: ["In Ordnung! Trotzdem einen schönen Tag. 🌻", "Okay! Genieß den Tag. 🌟", "Verstanden! Pass auf dich auf. ✨", "Kein Problem! Hab einen guten Tag. 💫"],
                pt: ["Tudo bem! Tenha um bom dia. 🌴", "Ok! Aproveite o dia. 🌟", "Entendi! Se cuida. ✨", "Sem problema! Tudo de bom. 💫"],
                it: ["D'accordo! Buona giornata comunque. 🌈", "Ok! Goditi la giornata. 🌟", "Capito! Stammi bene. ✨", "Nessun problema! Buona continuazione. 💫"],
                ru: ["Ладно! Хорошего дня в любом случае. ☀️", "Ок! Наслаждайся днём. 🌟", "Понял! Береги себя. ✨", "Без проблем! Всего хорошего. 💫"],
                ar: ["ماشي! يومك سعيد على كل حال. 🌸", "طيب! استمتع بيومك. 🌟", "تمام! خلي بالك على حالك. ✨", "ولا يهمك! بالتوفيق. 💫"],
                zh: ["好吧！那祝你有个好天。🌻", "好！享受你的一天。🌟", "懂了！保重。✨", "没问题！一切顺利。💫"],
                ja: ["わかった！それでも良い一日を。🌸", "オッケー！楽しんで。🌟", "了解！お元気で。✨", "問題ない！良い一日を。💫"],
                ko: ["알겠어! 그래도 좋은 하루 보내. 🌞", "오케이! 즐거운 하루 돼. 🌟", "알았어! 잘 지내. ✨", "괜찮아! 잘 가. 💫"],
                hi: ["ठीक है! फिर भी आपका दिन शुभ हो। 🌼", "अच्छा! दिन का आनंद लो। 🌟", "समझा! ख्याल रखना। ✨", "कोई बात नहीं! खुश रहो। 💫"]
            },
            la_forme: {
                fr: ["Bien ! Continue comme ça. 💪", "Parfait ! Garde la forme. 😊", "Excellent ! Reste en pleine forme. ✨", "Super ! Prends soin de toi. 💫"],
                en: ["Great! Keep it up. 💪", "Perfect! Stay in good shape. 😊", "Excellent! Keep feeling good. ✨", "Awesome! Take care. 💫"],
                es: ["¡Bien! Sigue así. 💪", "¡Perfecto! Mantente en forma. 😊", "¡Excelente! Sigue con energía. ✨", "¡Genial! Cuídate. 💫"],
                de: ["Gut! Weiter so. 💪", "Perfekt! Bleib in Form. 😊", "Ausgezeichnet! Bleib fit. ✨", "Super! Pass auf dich auf. 💫"],
                pt: ["Bom! Continue assim. 💪", "Perfeito! Mantenha a forma. 😊", "Excelente! Continue bem. ✨", "Ótimo! Se cuida. 💫"],
                it: ["Bene! Continua così. 💪", "Perfetto! Mantieniti in forma. 😊", "Eccellente! Stai bene. ✨", "Ottimo! Abbi cura di te. 💫"],
                ru: ["Хорошо! Продолжай в том же духе. 💪", "Отлично! Будь в форме. 😊", "Прекрасно! Оставайся бодрым. ✨", "Супер! Береги себя. 💫"],
                ar: ["كويس! استمر كده. 💪", "ممتاز! حافظ على نشاطك. 😊", "ميه ميه! خليك نشيط. ✨", "رائع! خلي بالك على حالك. 💫"],
                zh: ["好！继续保持。💪", "完美！保持状态。😊", "优秀！保持好精神。✨", "很棒！保重。💫"],
                ja: ["いいね！その調子で。💪", "完璧！その調子を保って。😊", "素晴らしい！元気でいて。✨", "最高！お元気で。💫"],
                ko: ["좋아! 계속 그렇게. 💪", "완벽해! 건강 유지해. 😊", "훌륭해! 기운 내. ✨", "최고야! 잘 지내. 💫"],
                hi: ["अच्छा! ऐसे ही जारी रखो। 💪", "शानदार! फिट रहो। 😊", "बेहतरीन! स्वस्थ रहो। ✨", "कमाल! ख्याल रखना। 💫"]
            },
            tout_va_bien: {
                fr: ["Parfait ! Que tout continue ainsi. 🌟", "Excellent ! Bonne continuation. 😊", "Super ! Tout roule. ✨", "Génial ! Prends soin de toi. 💫"],
                en: ["Perfect! May everything continue smoothly. 🌟", "Excellent! Keep it going. 😊", "Awesome! All good then. ✨", "Great! Take care. 💫"],
                es: ["¡Perfecto! Que todo siga así. 🌞", "¡Excelente! Que siga bien. 🌟", "¡Genial! Todo en orden. ✨", "¡Maravilloso! Cuídate. 💫"],
                de: ["Perfekt! Möge alles so weitergehen. 🌻", "Ausgezeichnet! Weiter so. 🌟", "Super! Alles klar. ✨", "Wunderbar! Pass auf dich auf. 💫"],
                pt: ["Perfeito! Que tudo continue bem. 🌴", "Excelente! Continue assim. 🌟", "Ótimo! Tudo certo. ✨", "Maravilhoso! Se cuida. 💫"],
                it: ["Perfetto! Che tutto continui così. 🌈", "Eccellente! Continua così. 🌟", "Ottimo! Tutto a posto. ✨", "Fantastico! Stammi bene. 💫"],
                ru: ["Отлично! Пусть всё так и продолжается. ☀️", "Прекрасно! Продолжай в том же духе. 🌟", "Супер! Всё в порядке. ✨", "Замечательно! Береги себя. 💫"],
                ar: ["تمام! عقبال ما يدوم كده. 🌸", "ممتاز! خليها على خير. 🌟", "كفو! كل الأمور تمام. ✨", "رائع! خلي بالك على حالك. 💫"],
                zh: ["完美！愿一切顺利。🌻", "优秀！继续保持。🌟", "很棒！一切安好。✨", "太好了！保重。💫"],
                ja: ["完璧！すべてうまくいきますように。🌸", "素晴らしい！その調子で。🌟", "最高！万事順調。✨", "良かった！お元気で。💫"],
                ko: ["완벽해! 모든 게 잘 되길. 🌞", "훌륭해! 계속 그렇게. 🌟", "최고야! 다 잘되고 있어. ✨", "좋아! 행복하길. 💫"],
                hi: ["बेहतरीन! सब कुछ अच्छा चलता रहे। 🌼", "शानदार! ऐसे ही चलता रहे। 🌟", "कमाल! सब ठीक है। ✨", "बढ़िया! ख्याल रखना। 💫"]
            },
            comment_tu_vas: {
                fr: ["Content de l'entendre ! Passe une excellente journée. 🌟", "Ravi pour toi ! Bonne continuation. 😊", "Super nouvelle ! Prends soin de toi. ✨", "Parfait ! Reste comme tu es. 💫"],
                en: ["Happy to hear that! Have a great day. 🌟", "Glad for you! Keep it up. 😊", "Wonderful news! Take care. ✨", "Perfect! Stay as you are. 💫"],
                es: ["¡Feliz de escucharlo! Que tengas un gran día. 🌞", "¡Contento por ti! Sigue así. 🌟", "¡Magnífica noticia! Cuídate. ✨", "¡Perfecto! Sigue como estás. 💫"],
                de: ["Freut mich zu hören! Einen schönen Tag. 🌻", "Freut mich für dich! Weiter so. 🌟", "Wunderbare Nachricht! Pass auf dich auf. ✨", "Perfekt! Bleib wie du bist. 💫"],
                pt: ["Feliz em ouvir isso! Tenha um ótimo dia. 🌴", "Contente por você! Continue assim. 🌟", "Notícia maravilhosa! Se cuida. ✨", "Perfeito! Continue como está. 💫"],
                it: ["Felice di sentirlo! Buona giornata. 🌈", "Contento per te! Continua così. 🌟", "Ottima notizia! Stammi bene. ✨", "Perfetto! Resta come sei. 💫"],
                ru: ["Рад слышать! Хорошего дня. ☀️", "Рад за тебя! Продолжай. 🌟", "Прекрасная новость! Береги себя. ✨", "Отлично! Оставайся таким. 💫"],
                ar: ["فرحان لسماع ذلك! يومك سعيد. 🌸", "مبسوط لك! استمر. 🌟", "خبر رائع! خلي بالك على حالك. ✨", "ممتاز! ابقَ كما أنت. 💫"],
                zh: ["很高兴听到这个！祝你有美好的一天。🌻", "为你高兴！继续保持。🌟", "好消息！保重。✨", "完美！保持现在的样子。💫"],
                ja: ["嬉しい知らせ！良い一日を。🌸", "良かったね！その調子で。🌟", "素晴らしい知らせ！お元気で。✨", "完璧！そのままでいて。💫"],
                ko: ["기쁜 소식이야! 좋은 하루 보내. 🌞", "잘됐다! 계속 그렇게. 🌟", "멋진 소식이야! 잘 지내. ✨", "완벽해! 지금 그대로 있어. 💫"],
                hi: ["सुनकर खुशी हुई! आपका दिन शुभ हो। 🌼", "तुम्हारे लिए खुश हूँ! ऐसे ही रहो। 🌟", "शानदार खबर! ख्याल रखना। ✨", "बेहतरीन! जैसे हो वैसे रहो। 💫"]
            }
        };

        const multiLangNegativeResponses = {
            ca_va: {
                fr: ["Désolé d'apprendre ça. Courage, ça ira mieux. 💪", "Je comprends. Les moments difficiles passent. 🌈", "Courage ! Demain est un autre jour. ✨", "Pas facile... Mais tu es plus fort que tu ne le penses. 💫"],
                en: ["Sorry to hear that. Stay strong, it'll get better. 💪", "I understand. Tough times pass. Hang in there. 🌈", "Keep your head up! Tomorrow is a new day. ✨", "It's okay to not be okay. You're stronger than you think. 💫"],
                es: ["Siento escuchar eso. Ánimo, todo mejorará. 💪", "Te entiendo. Los momentos difíciles pasan. 🌈", "¡Arriba ese ánimo! Mañana será otro día. ✨", "No pasa nada por no estar bien. Eres más fuerte. 💫"],
                de: ["Tut mir leid zu hören. Kopf hoch, es wird besser. 💪", "Ich verstehe. Schwere Zeiten gehen vorbei. 🌈", "Bleib stark! Morgen ist ein neuer Tag. ✨", "Es ist okay, mal nicht okay zu sein. Du bist stärker. 💫"],
                pt: ["Sinto muito por isso. Força, vai melhorar. 💪", "Entendo. Tempos difíceis passam. Aguenta firme. 🌈", "Levanta a cabeça! Amanhã é outro dia. ✨", "Tudo bem não estar bem. Você é mais forte. 💫"],
                it: ["Mi dispiace. Forza, andrà meglio. 💪", "Capisco. I momenti difficili passano. Resisti. 🌈", "Tieni duro! Domani è un altro giorno. ✨", "Va bene non stare bene. Sei più forte. 💫"],
                ru: ["Жаль это слышать. Держись, всё наладится. 💪", "Понимаю. Трудные времена проходят. 🌈", "Не падай духом! Завтра новый день. ✨", "Это нормально — не быть в порядке. Ты сильнее. 💫"],
                ar: ["آسف لسماع ذلك. تشجع، الأمور ستتحسن. 💪", "أفهمك. الأوقات الصعبة تمر. اصمد. 🌈", "ارفع رأسك! غداً يوم جديد. ✨", "لا بأس أن لا تكون بخير. أنت أقوى. 💫"],
                zh: ["很遗憾听到这个。振作起来，会好起来的。💪", "我理解。艰难时刻会过去的。坚持住。🌈", "抬起头！明天是新的一天。✨", "不好也没关系。你比自己想象的更坚强。💫"],
                ja: ["それは残念。元気出して、きっと良くなる。💪", "わかるよ。つらい時は過ぎ去る。がんばって。🌈", "顔を上げて！明日は新しい日。✨", "大丈夫じゃなくても大丈夫。君は思うより強い。💫"],
                ko: ["안타깝다. 힘내, 나아질 거야. 💪", "이해해. 힘든 시간은 지나가. 버텨. 🌈", "고개 들어! 내일은 새로운 날이야. ✨", "괜찮지 않아도 괜찮아. 넌 생각보다 강해. 💫"],
                hi: ["यह सुनकर दुख हुआ। हिम्मत रखो, सब ठीक होगा। 💪", "मैं समझता हूँ। मुश्किल वक्त गुज़र जाता है। 🌈", "सिर उठाओ! कल नया दिन है। ✨", "ठीक न होना भी ठीक है। तुम सोच से ज़्यादा मज़बूत हो। 💫"]
            },
            quoi_de_neuf: {
                fr: ["Je vois. J'espère que ça ira mieux bientôt. 🌈", "D'accord. Prends soin de toi surtout. 💪", "Compris. N'hésite pas si tu as besoin de parler. ✨", "Ok. Les choses finiront par s'arranger. 💫"],
                en: ["I see. Hope things get better soon. 🌈", "Okay. Take care of yourself. 💪", "Got it. Don't hesitate if you need to talk. ✨", "Alright. Things will work out eventually. 💫"],
                es: ["Ya veo. Espero que las cosas mejoren pronto. 🌈", "Entendido. Cuídate mucho. 💪", "Comprendido. No dudes si necesitas hablar. ✨", "De acuerdo. Las cosas se arreglarán. 💫"],
                de: ["Verstehe. Hoffe, es wird bald besser. 🌈", "Okay. Pass auf dich auf. 💪", "Verstanden. Zögere nicht zu reden. ✨", "In Ordnung. Es wird sich alles fügen. 💫"],
                pt: ["Entendo. Espero que as coisas melhorem logo. 🌈", "Ok. Cuide-se bem. 💪", "Compreendido. Não hesite se precisar conversar. ✨", "Certo. As coisas vão se ajeitar. 💫"],
                it: ["Capisco. Spero che le cose migliorino presto. 🌈", "Ok. Prenditi cura di te. 💪", "Capito. Non esitare se hai bisogno di parlare. ✨", "D'accordo. Le cose si sistemeranno. 💫"],
                ru: ["Понятно. Надеюсь, скоро всё наладится. 🌈", "Ладно. Береги себя. 💪", "Понял. Не стесняйся, если нужно поговорить. ✨", "Хорошо. Всё образуется. 💫"],
                ar: ["فهمت. إن شاء الله الأمور تتحسن. 🌈", "طيب. خلي بالك على حالك. 💪", "تمام. ما تتردد لو احتجت تتكلم. ✨", "ماشي. الأمور راح تتصلح. 💫"],
                zh: ["明白了。希望一切会好起来。🌈", "好。照顾好自己。💪", "懂了。需要说话时别犹豫。✨", "好吧。事情会解决的。💫"],
                ja: ["なるほど。早く良くなるといいね。🌈", "わかった。お大事に。💪", "了解。話したい時は遠慮しないで。✨", "オッケー。物事はうまくいくよ。💫"],
                ko: ["그렇구나. 곧 나아지길 바라. 🌈", "알겠어. 몸 조심해. 💪", "이해했어. 얘기 필요하면 망설이지 마. ✨", "그래. 일이 잘 풀릴 거야. 💫"],
                hi: ["समझा। उम्मीद है जल्द सब ठीक होगा। 🌈", "ठीक है। अपना ख्याल रखना। 💪", "समझ गया। बात करनी हो तो झिझकना मत। ✨", "अच्छा। सब कुछ ठीक हो जाएगा। 💫"]
            },
            la_forme: {
                fr: ["Désolé pour toi. Repose-toi bien. 🌙", "Courage, retrouve la forme vite. 💪", "Prends du temps pour toi, ça ira mieux. 🌈", "Ménage-toi, la santé avant tout. ✨"],
                en: ["Sorry to hear that. Get some rest. 🌙", "Stay strong, bounce back soon. 💪", "Take time for yourself, it'll get better. 🌈", "Take it easy, health first. ✨"],
                es: ["Lo siento. Descansa bien. 🌙", "Ánimo, recupérate pronto. 💪", "Tómate tiempo para ti, mejorará. 🌈", "Cuídate, la salud es primero. ✨"],
                de: ["Tut mir leid. Ruh dich gut aus. 🌙", "Kopf hoch, erhole dich schnell. 💪", "Nimm dir Zeit für dich, es wird besser. 🌈", "Schon dich, Gesundheit geht vor. ✨"],
                pt: ["Sinto muito. Descanse bem. 🌙", "Força, recupere-se logo. 💪", "Tire um tempo para você, vai melhorar. 🌈", "Cuide-se, saúde em primeiro lugar. ✨"],
                it: ["Mi dispiace. Riposati bene. 🌙", "Forza, rimettiti presto. 💪", "Prenditi del tempo per te, migliorerà. 🌈", "Riguardati, la salute prima di tutto. ✨"],
                ru: ["Жаль. Отдохни хорошо. 🌙", "Держись, поправляйся скорее. 💪", "Удели время себе, станет лучше. 🌈", "Береги себя, здоровье прежде всего. ✨"],
                ar: ["آسف. ارتاح كويس. 🌙", "تشجع، تعافى بسرعة. 💪", "خذ وقتك لنفسك، الأمور راح تتحسن. 🌈", "اهتم بنفسك، الصحة أولاً. ✨"],
                zh: ["很遗憾。好好休息。🌙", "振作起来，早日康复。💪", "给自己一点时间，会好起来的。🌈", "保重，健康第一。✨"],
                ja: ["残念。ゆっくり休んで。🌙", "元気出して、早く回復して。💪", "自分のために時間を使って、良くなるよ。🌈", "無理しないで、健康第一。✨"],
                ko: ["안타깝다. 푹 쉬어. 🌙", "힘내, 빨리 회복해. 💪", "너를 위한 시간 가져, 나아질 거야. 🌈", "몸조심해, 건강이 먼저야. ✨"],
                hi: ["दुख हुआ। अच्छे से आराम करो। 🌙", "हिम्मत रखो, जल्द ठीक हो जाओ। 💪", "अपने लिए समय निकालो, सब ठीक होगा। 🌈", "अपना ध्यान रखो, सेहत पहले। ✨"]
            },
            tout_va_bien: {
                fr: ["Je vois. Les choses s'arrangeront. 🌈", "Désolé pour toi. Reste fort. 💪", "Parfois c'est dur, mais ça passe. ✨", "Garde espoir, tout finira par s'arranger. 💫"],
                en: ["I see. Things will get better. 🌈", "Sorry about that. Stay strong. 💪", "Sometimes it's tough, but it passes. ✨", "Keep hope, everything will work out. 💫"],
                es: ["Entiendo. Las cosas mejorarán. 🌈", "Lo siento. Mantente fuerte. 💪", "A veces es difícil, pero pasa. ✨", "Mantén la esperanza, todo se arreglará. 💫"],
                de: ["Verstehe. Die Dinge werden besser. 🌈", "Tut mir leid. Bleib stark. 💪", "Manchmal ist es schwer, aber es geht vorbei. ✨", "Behalte die Hoffnung, alles wird gut. 💫"],
                pt: ["Entendo. As coisas vão melhorar. 🌈", "Sinto muito. Fique forte. 💪", "Às vezes é difícil, mas passa. ✨", "Mantenha a esperança, tudo se resolve. 💫"],
                it: ["Capisco. Le cose miglioreranno. 🌈", "Mi dispiace. Resta forte. 💪", "A volte è dura, ma passa. ✨", "Mantieni la speranza, tutto si sistemerà. 💫"],
                ru: ["Понимаю. Всё наладится. 🌈", "Жаль. Будь сильным. 💪", "Иногда тяжело, но это проходит. ✨", "Сохраняй надежду, всё образуется. 💫"],
                ar: ["فاهم. الأمور راح تتحسن. 🌈", "آسف. ابقَ قوياً. 💪", "أحياناً الوضع صعب، لكنه يمر. ✨", "حافظ على الأمل، كل شيء راح يتصلح. 💫"],
                zh: ["我明白。一切会好起来的。🌈", "很遗憾。保持坚强。💪", "有时候很难，但会过去的。✨", "保持希望，一切都会解决的。💫"],
                ja: ["わかるよ。物事は良くなる。🌈", "残念。強くいて。💪", "時にはつらいけど、過ぎ去るよ。✨", "希望を持って、すべてうまくいく。💫"],
                ko: ["이해해. 상황이 나아질 거야. 🌈", "안타깝다. 강하게 있어. 💪", "가끔은 힘들지만, 지나가. ✨", "희망을 가져, 다 잘될 거야. 💫"],
                hi: ["समझता हूँ। हालात सुधरेंगे। 🌈", "अफ़सोस। मज़बूत रहो। 💪", "कभी-कभी मुश्किल होता है, लेकिन गुज़र जाता है। ✨", "उम्मीद रखो, सब ठीक हो जाएगा। 💫"]
            },
            comment_tu_vas: {
                fr: ["Je suis désolé de l'apprendre. Les choses iront mieux. 🌈", "Parfois la vie est dure, mais tu es plus fort. 💪", "Courage. Je suis là si tu veux parler. ✨", "Ça me peine. N'oublie pas que ça passera. 💫"],
                en: ["I'm sorry to hear that. Things will get better. 🌈", "Sometimes life is hard, but you're stronger. 💪", "Stay strong. I'm here if you want to talk. ✨", "It saddens me. Remember, this too shall pass. 💫"],
                es: ["Lamento escuchar eso. Las cosas mejorarán. 🌈", "A veces la vida es dura, pero eres más fuerte. 💪", "Ánimo. Estoy aquí si quieres hablar. ✨", "Me entristece. Recuerda, esto también pasará. 💫"],
                de: ["Es tut mir leid zu hören. Es wird besser werden. 🌈", "Manchmal ist das Leben hart, aber du bist stärker. 💪", "Kopf hoch. Ich bin da, wenn du reden willst. ✨", "Es betrübt mich. Denk daran, auch das geht vorbei. 💫"],
                pt: ["Sinto muito ouvir isso. As coisas vão melhorar. 🌈", "Às vezes a vida é dura, mas você é mais forte. 💪", "Força. Estou aqui se quiser conversar. ✨", "Me entristece. Lembre-se, isso também passará. 💫"],
                it: ["Mi dispiace sentirlo. Le cose miglioreranno. 🌈", "A volte la vita è dura, ma sei più forte. 💪", "Coraggio. Sono qui se vuoi parlare. ✨", "Mi rattrista. Ricorda, anche questo passerà. 💫"],
                ru: ["Жаль это слышать. Всё наладится. 🌈", "Иногда жизнь тяжела, но ты сильнее. 💪", "Держись. Я здесь, если хочешь поговорить. ✨", "Меня печалит это. Помни, и это пройдёт. 💫"],
                ar: ["آسف لسماع هذا. الأمور ستتحسن. 🌈", "أحياناً الحياة صعبة، لكنك أقوى. 💪", "تشجع. أنا هنا لو أردت التحدث. ✨", "يحزنني ذلك. تذكر، هذا أيضاً سيمر. 💫"],
                zh: ["听到这个我很难过。一切会好起来的。🌈", "有时生活很艰难，但你更坚强。💪", "振作起来。想说话时我在这里。✨", "这让我伤心。记住，这也会过去。💫"],
                ja: ["それを聞いて悲しい。きっと良くなる。🌈", "人生は時に厳しいけど、君は強い。💪", "元気出して。話したいならここにいるよ。✨", "悲しいな。これも過ぎ去ることを忘れないで。💫"],
                ko: ["그 말 들으니 슬프다. 상황이 나아질 거야. 🌈", "가끔 인생은 힘들지만, 넌 더 강해. 💪", "힘내. 얘기하고 싶으면 여기 있을게. ✨", "마음이 아프다. 이것도 지나갈 거야. 💫"],
                hi: ["यह सुनकर दुख हुआ। हालात सुधरेंगे। 🌈", "कभी-कभी ज़िंदगी कठिन होती है, लेकिन तुम मज़बूत हो। 💪", "हिम्मत रखो। बात करनी हो तो मैं यहाँ हूँ। ✨", "मुझे दुख हुआ। याद रखो, यह भी गुज़र जाएगा। 💫"]
            }
        };

        const detectedSalutation = matchAnyPattern(msg, salutationPatterns);
        if (detectedSalutation) {
            const greetingType = getRandom(greetingTypes);
            const greetingList = multiLangGreetings[greetingType][detectedSalutation] || multiLangGreetings[greetingType].en;
            const reply = getRandom(greetingList);
            global.botSalutedUsers.set(uid, { type: greetingType, lang: detectedSalutation, time: now });
            setTimeout(() => {
                const record = global.botSalutedUsers.get(uid);
                if (record && record.time === now) {
                    global.botSalutedUsers.delete(uid);
                }
            }, 5 * 60 * 1000);
            return api.sendMessage(reply, threadID);
        }

        const record = global.botSalutedUsers.get(uid);
        if (record) {
            const detectedBien = matchAnyPattern(msg, responseCategories.bien);
            const detectedMal = matchAnyPattern(msg, responseCategories.mal);
            const detectedRien = matchAnyPattern(msg, responseCategories.rien);

            if (detectedBien) {
                const positiveList = multiLangPositiveResponses[record.type][detectedBien] || multiLangPositiveResponses[record.type].en;
                const reply = getRandom(positiveList);
                global.botSalutedUsers.delete(uid);
                return api.sendMessage(reply, threadID);
            }

            if (detectedMal) {
                const negativeList = multiLangNegativeResponses[record.type][detectedMal] || multiLangNegativeResponses[record.type].en;
                const reply = getRandom(negativeList);
                global.botSalutedUsers.delete(uid);
                return api.sendMessage(reply, threadID);
            }

            if (detectedRien && (record.type === "quoi_de_neuf")) {
                const rienResponses = {
                    fr: ["Ok ! Passe une excellente journée quand même. 🌟", "D'accord ! Prends soin de toi. 😊", "Pas de souci ! Profite bien. ✨"],
                    en: ["Okay! Have a great day anyway. 🌟", "Alright! Take care. 😊", "No worries! Enjoy. ✨"],
                    es: ["¡Ok! Que tengas un buen día. 🌞", "¡De acuerdo! Cuídate. 🌟", "¡Sin problema! Disfruta. ✨"],
                    de: ["Okay! Trotzdem einen schönen Tag. 🌻", "In Ordnung! Pass auf dich auf. 🌟", "Kein Problem! Genieß es. ✨"],
                    pt: ["Ok! Tenha um bom dia. 🌴", "Certo! Se cuida. 🌟", "Sem problema! Aproveite. ✨"],
                    it: ["Ok! Buona giornata comunque. 🌈", "D'accordo! Stammi bene. 🌟", "Nessun problema! Goditela. ✨"],
                    ru: ["Ок! Хорошего дня в любом случае. ☀️", "Ладно! Береги себя. 🌟", "Без проблем! Наслаждайся. ✨"],
                    ar: ["طيب! يومك سعيد على كل حال. 🌸", "ماشي! خلي بالك على حالك. 🌟", "ولا يهمك! استمتع. ✨"],
                    zh: ["好！那祝你有美好的一天。🌻", "好吧！保重。🌟", "没问题！享受吧。✨"],
                    ja: ["オッケー！それでも良い一日を。🌸", "わかった！お元気で。🌟", "問題ない！楽しんで。✨"],
                    ko: ["오케이! 그래도 좋은 하루 보내. 🌞", "알겠어! 잘 지내. 🌟", "괜찮아! 즐겨. ✨"],
                    hi: ["ठीक है! फिर भी आपका दिन शुभ हो। 🌼", "अच्छा! ख्याल रखना। 🌟", "कोई बात नहीं! आनंद लो। ✨"]
                };
                const reply = getRandom(rienResponses[record.lang] || rienResponses.fr);
                global.botSalutedUsers.delete(uid);
                return api.sendMessage(reply, threadID);
            }
        }
    },

    onStart: async function ({ api, event, args, message }) {
        if (typeof global.salutationEnabled === "undefined") {
            global.salutationEnabled = true;
        }
        if (typeof global.botSalutedUsers === "undefined") {
            global.botSalutedUsers = new Map();
        }

        const action = args[0] ? args[0].toLowerCase() : "status";

        if (action === "on") {
            global.salutationEnabled = true;
            return message.reply("✅ Salutation auto : **Activée**.");
        } else if (action === "off") {
            global.salutationEnabled = false;
            return message.reply("🔕 Salutation auto : **Désactivée**.");
        } else if (action === "status") {
            const etat = global.salutationEnabled ? "🟢 Activée" : "🔴 Désactivée";
            return message.reply(`État : ${etat}`);
        } else {
            return message.reply("❓ Usage : `salutation on`, `salutation off`, `salutation status`.");
        }
    }
};
