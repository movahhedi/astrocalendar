/* tsconfig must have the Lestin jsxFactory configured (same as your other Lestin apps). */

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface AstroCategory {
	key: string;
	title: string;
	shortDesc: string;
}

const CATEGORIES: AstroCategory[] = [
	{
		key: "F",
		title: "حوزه مالی",
		shortDesc:
			"منسوبات خانه دوم (بیت‌المال و المعاش). امور مرتبط با کسب مال و معاش: جلسات، معاملات، سرمایه‌گذاری، پیگیری‌ها و هر حلقه از زنجیرهٔ کسب مال.",
	},
	{
		key: "P",
		title: "شغل، شهرت و ارتباط با مادر",
		shortDesc:
			"منسوبات خانه دهم (بیت‌السلطان و الام). فعالیت‌های شغلی و حرفه‌ای مرتبط با شهرت، اعتبار و برندینگ؛ جلسه با مقامات و افراد سطح‌بالا؛ ارتباط با مادر.",
	},
	{
		key: "M",
		title: "تفاهم و مذاکره",
		shortDesc:
			"منسوبات خانه هفتم (بیت‌النساء و الاضداد). جلسات و مذاکراتی که به تفاهم مشترک و همراستا شدن طرفین نیاز دارند.",
	},
	{
		key: "K",
		title: "فرزندان، عشق و تفریح",
		shortDesc:
			"منسوبات خانه پنجم (بیت‌الاولاد و الفرح). تفریح و برنامه‌های شاد خانوادگی، روابط عاشقانه و نزدیک‌ شدن به فرزند و همسر.",
	},
	{
		key: "H",
		title: "امید، دوستان و اهداف",
		shortDesc:
			"منسوبات خانه یازدهم (بیت‌الرجاء و السعاده و الاصدقاء). شبکهٔ حامی، دوستان، اهداف بلندمدت و طلب حاجت از مهتران؛ مناسب اختیارات عمومی.",
	},
	{
		key: "G",
		title: "اختیارات عمومی، پدر و ساخت‌وساز",
		shortDesc:
			"منسوبات خانه چهارم (بیت‌الاب و العاقبه). کارهایی که عاقبت نیک آن‌ها مهم است؛ ارتباط با پدر؛ ساخت‌وساز و امور ملکی و عمرانی. مناسب اختیارات عمومی.",
	},
	{
		key: "L",
		title: "یادگیری، معنویت و سفر",
		shortDesc: "منسوبات خانه نهم (بیت‌السفر و الدین). شروع پروژه‌های علمی، یادگیری و پژوهش، امور معنوی و دینی و آغاز سفر.",
	},
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const pad = (n: number): string => String(n).padStart(2, "0");

/** "2026-06-30T14:00" -> "20260630T140000" (local wall-clock, Gregorian) */
function toGCalDate(local: string): string {
	const d = new Date(local);
	return (
		`${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
		`T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
	);
}

const buildTitle = (selected: AstroCategory[]): string => selected.map((c) => c.key).join(" & ");

const buildDetails = (selected: AstroCategory[]): string =>
	selected.map((c) => `${c.key} — ${c.title}\n${c.shortDesc}`).join("\n\n");

function buildGCalUrl(title: string, details: string, start: string, end: string): string {
	// Built manually so the "/" between dates stays unencoded (Google requires it).
	const params = [
		"action=TEMPLATE",
		`text=${encodeURIComponent(title)}`,
		`dates=${start}/${end}`,
		`details=${encodeURIComponent(details)}`,
	].join("&");
	return `https://calendar.google.com/calendar/render?${params}`;
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function App(): HTMLElement {
	const checkboxes: HTMLInputElement[] = [];

	const startInput = (<input type="datetime-local" class="field-input dt" id="start" lang="en-GB" />) as HTMLInputElement;
	const endInput = (<input type="datetime-local" class="field-input dt" id="end" lang="en-GB" />) as HTMLInputElement;

	const previewTitle = (<div class="preview-title">—</div>) as HTMLDivElement;
	const previewDetails = (<div class="preview-details">حوزه‌ای انتخاب نشده است.</div>) as HTMLDivElement;
	const errorBox = (<div class="error-box" hidden></div>) as HTMLDivElement;

	const getSelected = (): AstroCategory[] => CATEGORIES.filter((_, i) => checkboxes[i].checked);

	function updatePreview(): void {
		const selected = getSelected();
		if (selected.length === 0) {
			previewTitle.textContent = "—";
			previewDetails.textContent = "حوزه‌ای انتخاب نشده است.";
			return;
		}
		previewTitle.textContent = buildTitle(selected);
		previewDetails.textContent = buildDetails(selected);
	}

	const showError = (msg: string): void => {
		errorBox.textContent = msg;
		errorBox.hidden = false;
	};
	const clearError = (): void => {
		errorBox.hidden = true;
		errorBox.textContent = "";
	};

	function onAdd(): void {
		clearError();
		const selected = getSelected();
		if (selected.length === 0) return showError("حداقل یک حوزه را انتخاب کنید.");
		if (!startInput.value || !endInput.value) return showError("زمان شروع و پایان را وارد کنید.");
		if (new Date(endInput.value) <= new Date(startInput.value)) return showError("زمان پایان باید بعد از زمان شروع باشد.");

		const url = buildGCalUrl(
			buildTitle(selected),
			buildDetails(selected),
			toGCalDate(startInput.value),
			toGCalDate(endInput.value),
		);
		window.open(url, "_blank", "noopener");
	}

	startInput.addEventListener("input", clearError);
	endInput.addEventListener("input", clearError);

	/* category cards */
	const catList = (<div class="cat-list"></div>) as HTMLDivElement;
	CATEGORIES.forEach((category) => {
		const checkbox = (<input type="checkbox" class="cat-checkbox" value={category.key} />) as HTMLInputElement;
		checkbox.addEventListener("change", () => {
			updatePreview();
			clearError();
		});
		checkboxes.push(checkbox);

		catList.appendChild(
			<label class="cat-item" data-key={category.key}>
				{checkbox}
				<span class="cat-key">{category.key}</span>
				<span class="cat-body">
					<span class="cat-title">{category.title}</span>
					<span class="cat-desc">{category.shortDesc}</span>
				</span>
				<span class="cat-check" aria-hidden="true">
					✓
				</span>
			</label>,
		);
	});

	const addBtn = (
		<button type="button" class="add-btn">
			افزودن به تقویم گوگل
		</button>
	) as HTMLButtonElement;
	addBtn.addEventListener("click", onAdd);

	return (
		<div class="card">
			<header class="head">
				<h1 class="head-title">بلوک زمانی نجومی</h1>
				<p class="head-sub">
					حوزه‌ها را انتخاب کنید، زمان شروع و پایان را وارد کنید و روی «افزودن» بزنید تا رویداد در تقویم گوگل ساخته
					شود.
				</p>
			</header>

			<section class="section">
				<div class="section-label">
					حوزه‌ها <span class="hint">(چند انتخابی)</span>
				</div>
				{catList}
			</section>

			<section class="section times">
				<div class="field">
					<label class="field-label" for="start">
						تاریخ و ساعت شروع
					</label>
					{startInput}
				</div>
				<div class="field">
					<label class="field-label" for="end">
						تاریخ و ساعت پایان
					</label>
					{endInput}
				</div>
			</section>

			<section class="section">
				<div class="section-label">پیش‌نمایش رویداد</div>
				<div class="preview-box">
					<div class="preview-row">
						<span class="preview-key">عنوان:</span>
						{previewTitle}
					</div>
					<div class="preview-row col">
						<span class="preview-key">توضیحات:</span>
						{previewDetails}
					</div>
				</div>
			</section>

			{errorBox}
			{addBtn}
		</div>
	);
}

document.body.append(
	<div id="app">
		<App />
	</div>,
);
