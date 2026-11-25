/* 每日英语单词卡 · 词库
 * 每天 5 词；每天北京时间 08:27 解锁当日批次（首日 start 直接可用）。
 * 例句逐条标注来源：src「自编例句」为结合生活/职场场景自编；
 * src「引用例句 · Wiktionary」引自 Wiktionary 词典例句（经 Free Dictionary API 收录）。
 * 之后的批次由定时任务追加到 days 对象中（见 js/pool.js 候选池）。
 */
window.BANK_META = {"start":"2026-11-25","unlock":"08:27","tz":"Asia/Shanghai"};

window.WORD_BANK = {
  days: {
    "2026-11-25": [
      {
        w: "leverage", pos: "v. 及物 / n.",
        uk: "/ˈliːvərɪdʒ/", us: "/ˈlevərɪdʒ/",
        en: "to use something you already have, such as a skill or a connection, to get a better result",
        zh: "（充分）利用、借助（已有的优势、资源以达成更好的结果）",
        ex: [
          { en: "She leveraged her bilingual background to win the client meeting.", zh: "她凭借双语的背景优势，争取到了与客户见面的机会。", src: "自编例句" },
          { en: "Small shops can leverage social media to reach customers without spending much.", zh: "小店可以利用社交媒体低成本地触达顾客。", src: "自编例句" },
          { en: "A crowbar uses leverage to pry nails out of wood.", zh: "撬棍利用杠杆原理，把钉子从木头里撬出来。", src: "引用例句 · Wiktionary" }
        ],
        tip: "leverage 名词本义是「杠杆」，动词即「用杠杆撬动」——联想：用最小的力撬动最大的资源（阿基米德：给我一个支点……）。"
      },
      {
        w: "procrastinate", pos: "v. 不及物",
        uk: "/prəʊˈkræstɪneɪt/", us: "/proʊˈkræstɪneɪt/",
        en: "to keep delaying something that must be done, usually because you find it unpleasant",
        zh: "拖延，耽搁（该做的事）",
        ex: [
          { en: "I keep procrastinating on writing my weekly report until Friday night.", zh: "写周报这件事我总是一拖再拖，拖到周五晚上。", src: "自编例句" },
          { en: "Stop procrastinating — the earlier you book the train ticket, the cheaper it is.", zh: "别再拖了——火车票越早订越便宜。", src: "自编例句" },
          { en: "He procrastinated until the last minute and had to stay up all night to finish.", zh: "他一直拖到最后一刻，不得不熬夜把事情做完。", src: "引用例句 · Wiktionary" }
        ],
        tip: "pro（向前）+ crastinus（拉丁语「明天的」）→「把事情推往明天」。职场高频词，名词形式 procrastination。"
      },
      {
        w: "commute", pos: "v. / n.",
        uk: "/kəˈmjuːt/", us: "/kəˈmjuːt/",
        en: "v. to travel regularly between your home and your workplace; n. the journey itself",
        zh: "v. （长距离）通勤，上下班往返；n. 通勤路程",
        ex: [
          { en: "I commute to the office by subway, which takes about forty minutes each way.", zh: "我乘地铁通勤上班，单程大约四十分钟。", src: "自编例句" },
          { en: "After moving closer to work, her daily commute shrank from ninety minutes to fifteen.", zh: "搬到公司附近后，她每天的通勤时间从 90 分钟缩短到 15 分钟。", src: "自编例句" },
          { en: "Remote work removed the commute entirely, so he reads an extra hour every morning.", zh: "远程办公完全省去了通勤，他每天早上能多读一小时书。", src: "自编例句" }
        ],
        tip: "com（来回）+ mute（变换，同 mutate 词根）→「在两地之间变换」→往返通勤。新闻里 commute 也有「减刑」义，属熟词僻义。"
      },
      {
        w: "negotiate", pos: "v.",
        uk: "/nɪˈɡəʊʃieɪt/", us: "/nɪˈɡoʊʃieɪt/",
        en: "to discuss something formally with someone in order to reach an agreement",
        zh: "谈判，协商；（就价格、条件等）洽谈",
        ex: [
          { en: "Before signing, she negotiated a higher salary and two extra days of remote work.", zh: "签约之前，她谈到了更高的薪水和每周多两天远程办公。", src: "自编例句" },
          { en: "You can often negotiate the rent if you promise a longer lease.", zh: "如果你承诺签更长的租约，房租通常是可以谈的。", src: "自编例句" },
          { en: "The client and server computers must first negotiate a network protocol to be used.", zh: "客户端与服务器计算机必须先协商好要使用的网络协议。", src: "引用例句 · Wiktionary" }
        ],
        tip: "拆自拉丁语 neg（不）+ otium（闲暇）→「没有闲工夫，得认真谈」→谈判。注意别漏写中间的 t：negotiate。"
      },
      {
        w: "errand", pos: "n. 可数",
        uk: "/ˈerənd/", us: "/ˈerənd/",
        en: "a short trip you make to do or get something, such as buying food or posting a letter",
        zh: "差事；（短程的）跑腿，办杂事",
        ex: [
          { en: "I'll be out running errands — the bank, the post office, and the dry cleaner's.", zh: "我要出门办几件事——去银行、邮局和干洗店。", src: "自编例句" },
          { en: "Could you pick up my package? The locker is right on your errand route.", zh: "你能顺路帮我取一下快递吗？取件柜就在你跑腿的路线上。", src: "自编例句" },
          { en: "Sending the kid on small errands is a classic way to teach responsibility.", zh: "让孩子跑腿办点小事，是培养责任感的经典方式。", src: "自编例句" }
        ],
        tip: "固定搭配 run errands（办事、跑腿）。联想 err（出差错）+ and：小事就算出了差错也无妨。注意 errand boy 带轻蔑意味，职场慎用。"
      }
    ],

    "2026-11-26": [
      {
        w: "delegate", pos: "v. / n.",
        uk: "v. /ˈdelɪɡeɪt/ · n. /ˈdelɪɡət/", us: "v. /ˈdelɪɡeɪt/ · n. /ˈdelɪɡət/",
        en: "v. to give part of your work or authority to someone else; n. a person chosen to represent a group at a meeting",
        zh: "v. 委派，授权（把任务交给他人）；n. 代表，会议代表",
        ex: [
          { en: "A good manager delegates routine tasks and keeps only the decisions that matter.", zh: "好的管理者会把例行任务委派出去，只保留真正重要的决策。", src: "自编例句" },
          { en: "I used to do everything myself, but learning to delegate cut my workload in half.", zh: "我以前事事亲力亲为，学会授权之后工作量减了一半。", src: "自编例句" },
          { en: "Each department sent two delegates to the annual conference.", zh: "每个部门派了两名代表参加年会。", src: "自编例句" }
        ],
        tip: "重音区分名/动：DElegate（代表）/ deleGATE（委派）。de（下去）+ legate（派使者）→ 把任务「派下去」。"
      },
      {
        w: "chore", pos: "n. 可数",
        uk: "/tʃɔː(r)/", us: "/tʃɔːrd/",
        en: "a small job that has to be done regularly at home, such as cleaning or washing dishes",
        zh: "家务杂事；例行琐事",
        ex: [
          { en: "In our flat, cooking is my chore and taking out the trash is hers.", zh: "在我们公寓，做饭是我的活儿，倒垃圾是她的。", src: "自编例句" },
          { en: "Weekday chores feel much lighter when music is playing.", zh: "放着音乐做日常家务，会轻松许多。", src: "自编例句" },
          { en: "Washing dishes is a chore, but we cannot just stop eating.", zh: "洗碗是件烦人的杂活，但我们总不能从此不吃饭吧。", src: "引用例句 · Wiktionary" }
        ],
        tip: "固定搭配 household chores（家务活）。谐音联想「啾——」，像扫帚划过地面的声音。"
      },
      {
        w: "estimate", pos: "v. / n.",
        uk: "v. /ˈestɪmeɪt/ · n. /ˈestɪmət/", us: "v. /ˈestɪmeɪt/ · n. /ˈestɪmət/",
        en: "v. to guess a number or amount by calculating roughly; n. the guess itself, or a price given in advance",
        zh: "v. 估算，估计；n. 估计值；（专业机构给出的）报价",
        ex: [
          { en: "The mechanic estimated the repair at around eight hundred yuan.", zh: "修理工估计修理费大约 800 元。", src: "自编例句" },
          { en: "Don't treat my number as exact — it's a rough estimate based on last year.", zh: "别把我说的数字当精确值——那只是基于去年的粗略估算。", src: "自编例句" },
          { en: "We collected three estimates before choosing which company would repaint the flat.", zh: "我们拿了三份报价，才决定请哪家公司重新粉刷公寓。", src: "自编例句" }
        ],
        tip: "重音「名前动后」：ESTimate（名词估计值）/ esTImate（动词估计），和 delegate 同规律。词根 estim（价值）。"
      },
      {
        w: "incentive", pos: "n. 可数/不可数",
        uk: "/ɪnˈsentɪv/", us: "/ɪnˈsentɪv/",
        en: "something that encourages you to work harder or do something, such as a reward",
        zh: "激励，刺激，动力（常指奖励性的）",
        ex: [
          { en: "The company offers a quarterly bonus as an incentive for hitting sales targets.", zh: "公司提供季度奖金，作为达成销售目标的激励。", src: "自编例句" },
          { en: "Free shipping is a strong incentive for online shoppers to add one more item.", zh: "免运费对网购者是很强的「再加一件」的动力。", src: "自编例句" },
          { en: "Management offered the sales team a $500 incentive for each car sold.", zh: "管理层向销售团队承诺：每卖出一辆车，就有 500 美元的奖励。", src: "引用例句 · Wiktionary" }
        ],
        tip: "联想记忆法：in（往里）+ cent（分币）+ ive →「往兜里塞硬币」→金钱激励。搭配 have / provide an incentive to do sth。"
      },
      {
        w: "reservation", pos: "n. 可数",
        uk: "/ˌrezəˈveɪʃn/", us: "/ˌrezərˈveɪʃn/",
        en: "an arrangement to keep a seat, table or room for you; also, a feeling of doubt about a plan",
        zh: "预订（座位、房间等）；保留意见（常用复数 reservations）",
        ex: [
          { en: "I made a reservation for four at the hotpot place for Friday night.", zh: "我在那家火锅店订了周五晚上四个人的位子。", src: "自编例句" },
          { en: "The hotel lost our reservation, so they upgraded us to a suite for free.", zh: "酒店弄丢了我们的预订，于是免费把我们升级到了套房。", src: "自编例句" },
          { en: "I have a hotel reservation in the name of Mr Smith.", zh: "我用史密斯先生的名字预订了酒店房间。", src: "引用例句 · Wiktionary" }
        ],
        tip: "一词两义：①预订（make a reservation）②保留意见（have reservations about）。动词 reserve 同样两义：预订 / 保留。"
      }
    ],

    "2026-11-27": [
      {
        w: "prioritize", pos: "v. 及物",
        uk: "/praɪˈɒrətaɪz/", us: "/praɪˈɔːrətaɪz/",
        en: "to deal with things in order of importance, or to treat one thing as more important than others",
        zh: "优先处理；按优先级排序",
        ex: [
          { en: "With three deadlines this week, prioritize the client report first.", zh: "本周有三个截止日期，先优先做客户报告。", src: "自编例句" },
          { en: "She prioritized sleep over late-night scrolling and felt sharper within a week.", zh: "她把睡眠排在深夜刷手机之前，一周内精力就明显变好。", src: "自编例句" },
          { en: "Learning to prioritize is really learning to say no to tasks that are good but not vital.", zh: "学会排优先级，本质上是学会对「不错但不重要」的事说不。", src: "自编例句" }
        ],
        tip: "priority（优先事项）+ -ize（动词化）。实用法则：每天只定三件「必做」，其余都可协商。"
      },
      {
        w: "warranty", pos: "n. 可数",
        uk: "/ˈwɒrənti/", us: "/ˈwɔːrənti/",
        en: "a written promise that a product will be repaired or replaced if it breaks within a certain period",
        zh: "保修单，质保（期）",
        ex: [
          { en: "The laptop is still under warranty, so the screen repair was free.", zh: "笔记本还在保修期内，所以屏幕维修是免费的。", src: "自编例句" },
          { en: "Keep the receipt — shops usually ask for it before honouring a warranty.", zh: "保留发票——商家处理保修之前通常要求出示。", src: "自编例句" },
          { en: "I made sure to check the terms of my warranty for my computer to ensure I was covered in case it broke down.", zh: "我特意查看了电脑的保修条款，确保万一出故障也能获得保障。", src: "引用例句 · Wiktionary" }
        ],
        tip: "under warranty（在保修期内）是高频搭配。warrant（v. 保证/使有必要）→ warranty（n. 质保），与 guarantee 近义。"
      },
      {
        w: "compromise", pos: "n. / v.",
        uk: "/ˈkɒmprəmaɪz/", us: "/ˈkɑːmprəmaɪz/",
        en: "an agreement in which both sides give up part of what they want; v. to settle a difference this way",
        zh: "n. 妥协，折中方案；v. 让步，折中；（被动）危及，使泄密",
        ex: [
          { en: "We reached a compromise: takeaway on Friday, home cooking the rest of the week.", zh: "我们达成了折中：周五点外卖，其余时间在家做饭。", src: "自编例句" },
          { en: "Neither side won completely — that is usually what a good compromise looks like.", zh: "没有一方全赢——好的妥协通常就是这个样子。", src: "自编例句" },
          { en: "He tried to compromise the security in the computer by guessing the password.", zh: "他试图通过猜测密码来攻破这台电脑的安全防护。", src: "引用例句 · Wiktionary" }
        ],
        tip: "com（共同）+ promise（承诺）→ 互相让一步、共同承诺。熟词僻义：be compromised（被攻破/泄露）在安全新闻里高频。"
      },
      {
        w: "streamline", pos: "v. 及物",
        uk: "/ˈstriːmlaɪn/", us: "/ˈstriːmlaɪn/",
        en: "to make a process simpler and more efficient by removing unnecessary steps",
        zh: "精简，使（流程、系统）更高效",
        ex: [
          { en: "The team streamlined the approval process from five signatures down to two.", zh: "团队把审批流程从五个签字精简到了两个。", src: "自编例句" },
          { en: "A shared shopping-list app streamlined our weekly grocery run.", zh: "一个共享购物清单 App 让我们每周的采购顺畅多了。", src: "自编例句" },
          { en: "New templates streamlined the monthly report from a full day to two hours.", zh: "新模板把月报从耗一整天压缩到了两小时。", src: "自编例句" }
        ],
        tip: "stream（溪流）+ line（线）→「像溪水一样顺直」→无阻碍、高效率。streamlined 也形容「流线型的」。"
      },
      {
        w: "subscription", pos: "n. 可数/不可数",
        uk: "/səbˈskrɪpʃn/", us: "/səbˈskrɪpʃn/",
        en: "money you pay regularly to receive a service, or the service itself",
        zh: "订阅（费）；订阅服务",
        ex: [
          { en: "Cancel any subscription you haven't used for a month — most people find at least one.", zh: "取消一个月都没用过的订阅——多数人至少能找出一个。", src: "自编例句" },
          { en: "The family subscription covers six people, so we split the music app bill.", zh: "家庭订阅可以覆盖六个人，所以我们拼单分摊了音乐 App 的费用。", src: "自编例句" },
          { en: "I have a monthly subscription to the Daily Telegraph newspaper.", zh: "我订了《每日电讯报》的月度订阅。", src: "引用例句 · Wiktionary" }
        ],
        tip: "sub（下面）+ script（写）→「在名单下面签名」→订阅。动词 subscribe to（订阅；赞同（观点））。"
      }
    ],

    "2026-11-28": [
      {
        w: "initiative", pos: "n.",
        uk: "/ɪˈnɪʃətɪv/", us: "/ɪˈnɪʃətɪv/",
        en: "the ability to act first without waiting to be told; a new plan intended to solve a problem",
        zh: "主动性，首创精神；（政府或公司发起的）倡议，举措",
        ex: [
          { en: "Use your initiative — if the printer jams, don't just wait for someone else.", zh: "发挥你的主动性——打印机卡纸了，别干等别人来处理。", src: "自编例句" },
          { en: "Taking initiative on small fixes is how junior staff get noticed.", zh: "在小修小补上主动出手，正是新人被注意到的方式。", src: "自编例句" },
          { en: "The city launched a recycling initiative with free bins for every household.", zh: "市里发起了一项回收倡议，给每户发放免费垃圾桶。", src: "自编例句" }
        ],
        tip: "initial（最初的）+ -ive →「迈出第一步」的能力。高频搭配 on one's own initiative（主动地、自发地）。"
      },
      {
        w: "appliance", pos: "n. 可数",
        uk: "/əˈplaɪəns/", us: "/əˈplaɪəns/",
        en: "a machine or device used in the home, such as a washing machine or a fridge",
        zh: "（家用）电器，器具",
        ex: [
          { en: "The new flat comes with basic appliances: a fridge, a washing machine and a stove.", zh: "新公寓带基础家电：冰箱、洗衣机和炉灶。", src: "自编例句" },
          { en: "Smart appliances can cut your electricity bill if you actually use the schedules.", zh: "智能家电若真能用上定时功能，是可以省电费的。", src: "自编例句" },
          { en: "Unplug small appliances when you travel — it is a simple safety habit.", zh: "出门旅行时拔掉小电器的插头——这是个简单的安全习惯。", src: "自编例句" }
        ],
        tip: "ap（去）+ ply（折叠、应用，同 apply 词根）→「被应用（到家务中）的工具」。home appliances 泛指家用电器。"
      },
      {
        w: "tedious", pos: "adj.",
        uk: "/ˈtiːdiəs/", us: "/ˈtiːdiəs/",
        en: "boring and lasting too long",
        zh: "乏味的，冗长无聊的",
        ex: [
          { en: "Copying data between two systems by hand is tedious, and perfect for a script.", zh: "在两套系统之间手工搬数据很枯燥，但正适合写个脚本来干。", src: "自编例句" },
          { en: "The training video was so tedious that half the room ended up on their phones.", zh: "培训视频无聊透顶，半屋子人最后都在看手机。", src: "自编例句" },
          { en: "Filling in the same form for every city made the trip planning tedious.", zh: "每到一城都要填同样的表格，行程规划变得乏味起来。", src: "自编例句" }
        ],
        tip: "谐音联想「踢踢儿死」——重复踢腿踢到死 → 单调乏味。比 boring/dull 更书面，写作提分词。"
      },
      {
        w: "consensus", pos: "n. 单数/不可数",
        uk: "/kənˈsensəs/", us: "/kənˈsensəs/",
        en: "an opinion or decision that everyone in a group agrees with",
        zh: "共识，一致意见",
        ex: [
          { en: "After thirty minutes of debate, we reached a consensus on the launch date.", zh: "经过半小时讨论，我们就上线日期达成了共识。", src: "自编例句" },
          { en: "There is a growing consensus that hybrid work is here to stay.", zh: "越来越多的人认同：混合办公将成为常态。", src: "自编例句" },
          { en: "After years of debate over the best wine to serve at Thanksgiving, no real consensus has emerged.", zh: "围绕感恩节该上哪种葡萄酒争论了多年，至今仍未形成真正的共识。", src: "引用例句 · Wiktionary" }
        ],
        tip: "con（共同）+ sens（感觉，同 sense 词根）→「共同的感觉」→共识。搭配 reach a consensus on sth；注意拼写中间是 sensus。"
      },
      {
        w: "refund", pos: "n. / v.",
        uk: "n. /ˈriːfʌnd/ · v. /rɪˈfʌnd/", us: "n. /ˈriːfʌnd/ · v. /rɪˈfʌnd/",
        en: "money given back to you when you return a product or a service is cancelled",
        zh: "n. 退款；v. 退还（款项）",
        ex: [
          { en: "The earphones broke within a week, and the store gave a full refund.", zh: "耳机一周内就坏了，商店全额退款。", src: "自编例句" },
          { en: "If the event is cancelled, tickets are refunded automatically within five days.", zh: "活动若取消，票款将在五天内自动退还。", src: "自编例句" },
          { en: "If the camera is faulty, you can return it to the store where you bought it for a full refund.", zh: "如果相机有质量问题，可以退回购买的商店，获得全额退款。", src: "引用例句 · Wiktionary" }
        ],
        tip: "重音「名前动后」：REFund（n. 退款）/ reFUND（v. 退还）。re（回）+ fund（资金）→ 资金回流。"
      }
    ],

    "2026-11-29": [
      {
        w: "workload", pos: "n. 单数/不可数",
        uk: "/ˈwɜːkləʊd/", us: "/ˈwɜːrkləʊd/",
        en: "the amount of work that a person is expected to do",
        zh: "工作量，工作负担",
        ex: [
          { en: "My workload doubles every December — budget season is brutal.", zh: "每年十二月我的工作量都会翻倍——预算季太难熬了。", src: "自编例句" },
          { en: "Sharing the workload with the new hire made evenings free again.", zh: "和新同事分担工作之后，晚上又空闲下来了。", src: "自编例句" },
          { en: "A heavy workload is a valid reason to ask for help, not a secret to keep.", zh: "工作量过大是求助的正当理由，不必藏着掖着。", src: "自编例句" }
        ],
        tip: "work（工作）+ load（负荷、装载量）→「工作载荷」。同类构词：information overload（信息过载）。"
      },
      {
        w: "recipe", pos: "n. 可数",
        uk: "/ˈresəpi/", us: "/ˈresəpi/",
        en: "a set of instructions for cooking a dish; also, a method for achieving something",
        zh: "食谱，烹饪法；（比喻）秘诀，方法",
        ex: [
          { en: "This braised chicken recipe needs only five ingredients and one pot.", zh: "这道炖鸡食谱只需要五种食材和一口锅。", src: "自编例句" },
          { en: "Follow the recipe exactly the first time, then adjust it to your taste.", zh: "第一次严格照食谱做，之后再按自己的口味调整。", src: "自编例句" },
          { en: "His new approach is definitely a recipe for success.", zh: "他的新方法绝对是成功的秘诀。", src: "引用例句 · Wiktionary" }
        ],
        tip: "别与 receipt（收据）混淆：recipe 中间是 pi。习语 a recipe for disaster（招灾的「配方」）很常用。"
      },
      {
        w: "feasible", pos: "adj.",
        uk: "/ˈfiːzəbl/", us: "/ˈfiːzəbl/",
        en: "possible and practical to do",
        zh: "可行的，行得通的",
        ex: [
          { en: "Moving the launch to March is feasible if we cut two features.", zh: "如果砍掉两个功能，把上线挪到三月是可行的。", src: "自编例句" },
          { en: "Is it feasible to visit both cities within a three-day trip?", zh: "三天时间的旅行，玩两座城市可行吗？", src: "自编例句" },
          { en: "His plan to rid Trafalgar Square of pigeons by bringing in peregrine falcons to eat them was dismissed as not feasible.", zh: "他提出用引入游隼捕食的办法清理特拉法加广场的鸽子，该计划因不具可行性被否决。", src: "引用例句 · Wiktionary" }
        ],
        tip: "词根 feas（做，源自拉丁语 facere）+ -ible（能够）→「能做的」→可行。近义 practical、viable。"
      },
      {
        w: "mentor", pos: "n. / v.",
        uk: "/ˈmentɔː(r)/", us: "/ˈmentɔːrd/",
        en: "an experienced person who guides someone with less experience; v. to guide someone this way",
        zh: "n. 导师，良师；v. 指导，带教",
        ex: [
          { en: "My mentor at work reviews my emails before big client calls.", zh: "工作中的导师会在我进行重要客户通话前帮我过一遍邮件。", src: "自编例句" },
          { en: "A good mentor asks questions rather than giving all the answers.", zh: "好导师提出问题，而不是给出现成的答案。", src: "自编例句" },
          { en: "She mentors two interns every summer and stays in touch with them for years.", zh: "她每年夏天带教两名实习生，并和他们保持多年的联系。", src: "自编例句" }
        ],
        tip: "典出《奥德赛》：Mentor 是奥德修斯家中的智者，雅典娜曾化身其形点拨其子——故引申为「良师」。"
      },
      {
        w: "reluctant", pos: "adj.",
        uk: "/rɪˈlʌktənt/", us: "/rɪˈlʌktənt/",
        en: "not willing to do something and hesitating before you do it",
        zh: "不情愿的，勉强的",
        ex: [
          { en: "He was reluctant to admit that the deadline was unrealistic.", zh: "他不愿承认那个截止日期不切实际。", src: "自编例句" },
          { en: "I'm reluctant to lend my car out, but happy to help you rent one.", zh: "我不太愿意把车借出去，但很乐意帮你租一辆。", src: "自编例句" },
          { en: "She was reluctant to lend him the money", zh: "她不太愿意把钱借给他。", src: "引用例句 · Wiktionary" }
        ],
        tip: "re（往回）+ luct（拉丁语「挣扎」）+ ant →「心里在挣扎」→不情愿。固定搭配 be reluctant to do sth。"
      }
    ],

    "2026-11-30": [
      {
        w: "agenda", pos: "n. 可数",
        uk: "/əˈdʒendə/", us: "/əˈdʒendə/",
        en: "a list of items to discuss at a meeting; also, a hidden plan behind someone's actions",
        zh: "议程，议事日程；（隐藏的）意图，算盘",
        ex: [
          { en: "Send the agenda a day before the meeting so people can prepare.", zh: "提前一天把议程发出去，让大家有所准备。", src: "自编例句" },
          { en: "The first item on the agenda is this quarter's budget overrun.", zh: "议程第一项是本季度的预算超支问题。", src: "自编例句" },
          { en: "Watch out for hidden agendas in meetings that 'suddenly' involve your project.", zh: "当心那些「突然」拉你的项目进议程背后的隐藏意图。", src: "自编例句" }
        ],
        tip: "词根 ag（做，同 act）+ -enda →「要办的事」→议程。习语 hidden agenda（隐藏的算盘）很常用。"
      },
      {
        w: "utility", pos: "n. 可数（常用复数）",
        uk: "/juːˈtɪləti/", us: "/juːˈtɪləti/",
        en: "a company that provides water, electricity or gas; also, the quality of being useful",
        zh: "公用事业（水电气等，常用复数 utilities 指水电网费）；效用，实用",
        ex: [
          { en: "Rent is five thousand a month, and utilities add another four hundred.", zh: "房租每月五千，水电燃气另加四百。", src: "自编例句" },
          { en: "Check the average utilities cost before signing the lease.", zh: "签租约之前，先了解一下水电费的大致行情。", src: "自编例句" },
          { en: "I've bought a new disk utility that can recover deleted files.", zh: "我买了一个新的磁盘工具软件，可以恢复被删除的文件。", src: "引用例句 · Wiktionary" }
        ],
        tip: "日常生活里最实用的是复数 utilities（水电网费账单）。词根 ut（用）→ utile「有用的」，形容词 utilitarian（实用的）。"
      },
      {
        w: "versatile", pos: "adj.",
        uk: "/ˈvɜːsətaɪl/", us: "/ˈvɜːrsətl/",
        en: "able to be used for many different purposes, or having many different skills",
        zh: "多用途的；多才多艺的，多面手的",
        ex: [
          { en: "A versatile jacket that works for both meetings and weekend hikes.", zh: "一件开会和周末徒步都能穿的多功能外套。", src: "自编例句" },
          { en: "She is a versatile engineer: frontend, backend, and decent at design too.", zh: "她是多面手工程师：前端、后端都行，设计也不赖。", src: "自编例句" },
          { en: "Eggs are the most versatile ingredient in my kitchen.", zh: "鸡蛋是我厨房里用途最广的食材。", src: "自编例句" }
        ],
        tip: "vers（转动，同 reverse 词根）+ atile →「到哪儿都转得开」→全能、多用途。"
      },
      {
        w: "resign", pos: "v.",
        uk: "/rɪˈzaɪn/", us: "/rɪˈzaɪn/",
        en: "to officially announce that you are leaving your job; (resign oneself to) to accept something unavoidable",
        zh: "辞职；（resign oneself to）听任，只好接受",
        ex: [
          { en: "She resigned after ten years to start her own studio.", zh: "十年之后她辞职，创办了自己的工作室。", src: "自编例句" },
          { en: "He handed in his resignation letter the day the new offer landed.", zh: "新的录用通知一到手，他当天就递交了辞职信。", src: "自编例句" },
          { en: "He resigned the crown to follow his heart.", zh: "他为追随内心而让出了王位。", src: "引用例句 · Wiktionary" }
        ],
        tip: "re（解除）+ sign（签名）→「把签过的名收回去」→辞职。熟词僻义：resign yourself to sth（认命、只好接受）。注意与 re-sign（重新签约）拼写差异。"
      },
      {
        w: "dilemma", pos: "n. 可数",
        uk: "/dɪˈlemə/", us: "/dəˈlemə/",
        en: "a situation in which you have to choose between two difficult options",
        zh: "困境，进退两难",
        ex: [
          { en: "The classic dilemma: a higher salary, or a shorter commute?", zh: "经典的两难：更高的薪水，还是更短的通勤？", src: "自编例句" },
          { en: "She faced a dilemma between joining the startup and waiting for the state firm's offer.", zh: "她在去创业公司和等国企录用通知之间陷入两难。", src: "自编例句" },
          { en: "Buying now risks overpaying; waiting risks the price rising — a real dilemma.", zh: "现在买怕买贵，再等又怕涨价——真让人两难。", src: "自编例句" }
        ],
        tip: "di（二，同 double）+ lemma（命题）→「两条命题来回撕扯你」。搭配 be in / face a dilemma；口语常说 catch-22。"
      }
    ],

    "2026-12-01": [
      {
        w: "appraisal", pos: "n. 可数",
        uk: "/əˈpreɪzl/", us: "/əˈpreɪzl/",
        en: "a judgement of the value, quality or performance of something or someone",
        zh: "评估，评价；（职场的）绩效面谈；估价",
        ex: [
          { en: "My annual appraisal is next week, so I'm collecting evidence of my wins.", zh: "下周是我的年度绩效评估，我正在整理业绩证据。", src: "自编例句" },
          { en: "The bank sent an appraiser, and the appraisal came in below our offer.", zh: "银行派了估价师，估价结果低于我们的出价。", src: "自编例句" },
          { en: "Treat the appraisal as a two-way conversation; bring your own questions.", zh: "把绩效面谈当成双向对话，带着你自己的问题去。", src: "自编例句" }
        ],
        tip: "ap + prais(e)（价值/赞扬）→ 给出价值判断。职场高频搭配 performance appraisal（绩效考核）。"
      },
      {
        w: "grocery", pos: "n.（常用复数 groceries）",
        uk: "/ˈɡrəʊsəri/", us: "/ˈɡroʊsəri/",
        en: "food and everyday household goods; a store that sells them; (do the) grocery shopping",
        zh: "食品杂货；杂货店；（do the groceries）采购日常食材",
        ex: [
          { en: "I do the groceries every Sunday morning before the crowds arrive.", zh: "我每周日早上、人还没多的时候去采购食材。", src: "自编例句" },
          { en: "Grocery delivery saves two hours a week, at the cost of a small fee.", zh: "生鲜配送每周能省两小时，代价是一点配送费。", src: "自编例句" },
          { en: "Add 'check the freezer' to the grocery list to avoid buying duplicates.", zh: "在采购清单里加一条「查冰箱冷冻层」，避免重复购买。", src: "自编例句" }
        ],
        tip: "美式说 grocery store（食品杂货店），groceries 指「采购回来的食品杂货」。动词短语 do the groceries 很地道。"
      },
      {
        w: "fulfill", pos: "v. 及物",
        uk: "英式拼作 fulfil /fʊlˈfɪl/", us: "/fʊlˈfɪl/",
        en: "to do or achieve what was promised, expected or required; to make people satisfied",
        zh: "履行，实现；满足（要求、期待）；使满足",
        ex: [
          { en: "The team fulfilled the contract two weeks ahead of schedule.", zh: "团队提前两周履行完了合同。", src: "自编例句" },
          { en: "A job that pays well but bores you rarely fulfills you for long.", zh: "报酬不错却无聊的工作，很难让人长久地感到满足。", src: "自编例句" },
          { en: "You made a promise, son, and now you must fulfill it.", zh: "你许下了诺言，孩子，现在就必须兑现它。", src: "引用例句 · Wiktionary" }
        ],
        tip: "full（满）+ fill（填）→「把期待填满」。名词 fulfillment 双关：履行 /（人生的）满足感。电商状态 fulfilled = 已发货履约。"
      },
      {
        w: "coordinate", pos: "v. / n.",
        uk: "v. /kəʊˈɔːdɪneɪt/", us: "v. /koʊˈɔːrdɪneɪt/",
        en: "v. to organize people or things so that they work together effectively; n. (coordinates) a set of numbers giving an exact position",
        zh: "v. 协调，统筹；n. （coordinates）坐标",
        ex: [
          { en: "I coordinate between design and engineering so nothing gets lost.", zh: "我在设计和工程之间做协调，确保信息不遗漏。", src: "自编例句" },
          { en: "Four families coordinated to share one tutor for the kids.", zh: "四户家庭协调合请了一位家教。", src: "自编例句" },
          { en: "Give me your coordinates and we'll come and rescue you.", zh: "把你的坐标发给我，我们就来救你。", src: "引用例句 · Wiktionary" }
        ],
        tip: "co（共同）+ ordinate（次序）→「让大家处在同一次序上」→协调。动词重音在 -di：coordiNATE。"
      },
      {
        w: "thorough", pos: "adj.",
        uk: "/ˈθʌrə/", us: "/ˈθɜːroʊ/",
        en: "complete and careful, including every detail; done with great care",
        zh: "彻底的，细致全面的，一丝不苟的",
        ex: [
          { en: "Give the contract a thorough read before signing anything.", zh: "签字之前，把合同从头到尾彻底读一遍。", src: "自编例句" },
          { en: "The doctor was thorough, checking symptoms I hadn't even mentioned.", zh: "医生非常细致，连我没提到的症状都检查了。", src: "自编例句" },
          { en: "He is the most thorough worker I have ever seen.", zh: "他是我见过的做事最细致周全的员工。", src: "引用例句 · Wiktionary" }
        ],
        tip: "注意拼写双 h：thorough。发音 /ˈθʌrə/（两拍），与 through /θruː/（一拍）区分。搭配 a thorough review / check。"
      }
    ]
  }
};
