# NetViz - عارض حركة الشبكة | Network Traffic Visualizer

[English](#english) | [العربية](#arabic)

<div dir="rtl">

# <a name="arabic"></a>عارض حركة الشبكة - NetViz

أداة بصرية لمراقبة وتحليل حركة الشبكة في الوقت الفعلي. تقدم عرضاً ثلاثي الأبعاد للاتصالات الشبكية مع واجهة مستخدم سهلة الاستخدام.

## المميزات الرئيسية

### 🔍 ثلاثة أنماط عرض مختلفة
- **عرض بسيط**: يعرض المصدر والوجهة وحجم البيانات والبروتوكول بتنسيق مبسط
- **عرض مفصل**: يوفر معلومات إضافية مثل نوع الجهاز والطوابع الزمنية
- **ملخص**: يعرض إحصائيات عامة عن الاتصالات النشطة

### 📊 لوحة إحصائيات مباشرة
- عدد العقد النشطة في الشبكة
- إجمالي حجم البيانات المتبادلة
- معدل نقل البيانات في الوقت الفعلي

### 🎮 تحكم تفاعلي
- إمكانية إيقاف/تشغيل دوران العرض ثلاثي الأبعاد
- إعادة ضبط منظور العرض
- تصفية وتنظيم عرض الاتصالات

### 🎯  واجهة المستخدم
- تصميم عصري وأنيق
- عرض منظم للاتصالات
- ألوان متناسقة وخطوط واضحة
- دعم كامل للغة العربية

## المتطلبات

- Python 3.8+
- Flask
- Scapy
- Three.js (مضمن)

## التثبيت

1. استنسخ المستودع:
```bash
git clone https://github.com/Al-shwaib/Network-Traffic-Visualizer.git
```

2. انتقل إلى مجلد المشروع:
```bash
cd Network-Traffic-Visualizer
```

3. إنشاء وتفعيل البيئة الافتراضية:
```bash
python -m venv venv
# تفعيل البيئة الافتراضية
venv\Scripts\activate  # لنظام Windows
source venv/bin/activate  # لنظام Linux/macOS
```

4. قم بتثبيت المتطلبات:
```bash
pip install -r requirements.txt
```

## التشغيل

1. شغل التطبيق:
```bash
python src/main.py
```

2. افتح المتصفح على العنوان:
```
http://localhost:5000
```

## ملاحظات مهمة

⚠️ **تنبيه**: هذه الأداة مخصصة للاستخدام الأخلاقي والقانوني فقط. يجب الحصول على الإذن المناسب قبل مراقبة أي شبكة.

## المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:
1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. تقديم Pull Request

## الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

</div>

---

# <a name="english"></a>NetViz - Network Traffic Visualizer

A visual tool for monitoring and analyzing network traffic in real-time. Provides a 3D visualization of network connections with an easy-to-use interface.

## Key Features

### 🔍 Three Different View Modes
- **Basic View**: Displays source, destination, data size, and protocol in a simplified format
- **Detailed View**: Provides additional information such as device type and timestamps
- **Summary View**: Shows general statistics about active connections

### 📊 Live Statistics Dashboard
- Number of active nodes in the network
- Total exchanged data size
- Real-time data transfer rate

### 🎮 Interactive Controls
- Ability to toggle 3D view rotation
- Reset view perspective
- Filter and organize connection display

### 🎯 UI Improvements
- Modern and elegant design
- Organized connection display
- Harmonious colors and clear fonts
- Full Arabic language support

## Requirements

- Python 3.8+
- Flask
- Scapy
- Three.js (included)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Al-shwaib/Network-Traffic-Visualizer.git
```

2. Navigate to project directory:
```bash
cd Network-Traffic-Visualizer
```

3. Create and activate virtual environment:
```bash
python -m venv venv
# Activate virtual environment
venv\Scripts\activate  # for Windows
source venv/bin/activate  # for Linux/macOS
```

4. Install requirements:
```bash
pip install -r requirements.txt
```

## Running

1. Run the application:
```bash
python src/main.py
```

2. Open browser at:
```
http://localhost:5000
```

## Important Notes

⚠️ **Warning**: This tool is intended for ethical and legal use only. Proper permission must be obtained before monitoring any network.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project
2. Create a feature branch
3. Submit a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
