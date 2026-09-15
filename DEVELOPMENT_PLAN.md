# DEVELOPMENT_PLAN.md

خطة التطوير الهندسية الشاملة لنظام الذاتية والأرشفة

## الهدف النهائي

تحويل المشروع من Prototype محلي (React + localStorage) إلى نظام مركزي حقيقي (Backend + PostgreSQL)

## القواعد غير القابلة للكسر

1. Architecture > Features
2. Correctness > Speed
3. لا تعديل بلا سبب
4. الحفاظ على البيانات الحالية
5. مرحلة واحدة في كل مرة
6. عدم الافتراض
7. employeeId هو الرابط الأساسي
8. الأمان على الخادم
9. بيانات تطوير فقط

## 25 مرحلة للتطوير

### PHASE 0: تثبيت المعمارية
- تحديث الوثائق
- توضيح الطبقات
- خارطة الانتقال

### PHASE 1: نماذج شؤون المنتسبين
- EmployeeLeave
- EmployeeTimePermission
- EmployeeAssignment
- EmployeeCourse

### PHASE 2: طبقة Personnel Services
- src/services/personnelService.ts

### PHASE 3: ملف المنتسب
- تطوير EmployeesView

### PHASE 4: الموقف اليومي
- ربط البيانات بشكل صحيح

### PHASE 5: Timeline
- عرض السجل الزمني للموظف

### PHASE 6: تحسين نموذج المعاملات
- TransactionEmployee

### PHASE 7: نظام حالات المعاملات
- فصل المفاهيم

### PHASE 8: سجل التدقيق
- AuditLog

### PHASE 9: التقارير
- تقارير متقدمة

### PHASE 10: التصدير
- PDF و Excel

### PHASE 11: الانتقال من LocalStorage
- إعداد Backend

### PHASE 12: Backend
- Node.js + Express + TypeScript

### PHASE 13: قاعدة البيانات
- PostgreSQL

### PHASE 14: Authentication
- نظام توثيق حقيقي

### PHASE 15: RBAC
- نظام صلاحيات

### PHASE 16: Access Scope
- فصل العلاقة والصلاحية

### PHASE 17: المرفقات
- نظام مرفقات آمن

### PHASE 18: الحذف
- Soft Delete

### PHASE 19: منع تعارض المستخدمين
- معالجة التحديثات المتزامنة

### PHASE 20: الشبكة الداخلية
- النشر على الشبكة

### PHASE 21: HTTPS
- تشفير البيانات

### PHASE 22: النسخ الاحتياطي
- نظام Backup منظم

### PHASE 23: الاختبارات
- Unit, Integration, Permission Tests

### PHASE 24: بيانات الاختبار
- Test data seeding

### PHASE 25: الانتقال للإنتاج
- قائمة التحقق النهائي

## طريقة العمل مع Copilot

```
IMPLEMENT PHASE X ONLY.

Read the repository first.

Do not implement future phases.

After implementation:
1. Run type check
2. Run build
3. Report results
4. STOP
```
