import httpx
import uuid

BASE_URL = "http://127.0.0.1:8000"

def test_health_and_config():
    with httpx.Client(base_url=BASE_URL) as client:
        # 1. Health
        res = client.get("/api/v1/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

        # 2. Meta config
        res = client.get("/api/v1/meta/config")
        assert res.status_code == 200
        data = res.json()
        assert "hazard_types" in data
        assert "likelihood_scale" in data
        assert "severity_scale" in data

def test_risk_calculation_engine():
    with httpx.Client(base_url=BASE_URL) as client:
        # Low risk: 1 x 2 = 2
        res = client.post("/api/v1/risk/calculate", json={"severity": 1, "likelihood": 2})
        assert res.status_code == 200
        assert res.json()["score"] == 2
        assert res.json()["level"] == "low"
        assert res.json()["requires_immediate_alert"] is False

        # Medium risk: 3 x 3 = 9
        res = client.post("/api/v1/risk/calculate", json={"severity": 3, "likelihood": 3})
        assert res.status_code == 200
        assert res.json()["score"] == 9
        assert res.json()["level"] == "medium"

        # High risk: 4 x 4 = 16
        res = client.post("/api/v1/risk/calculate", json={"severity": 4, "likelihood": 4})
        assert res.status_code == 200
        assert res.json()["score"] == 16
        assert res.json()["level"] == "high"
        assert res.json()["requires_immediate_alert"] is True

        # Critical risk: 5 x 5 = 25
        res = client.post("/api/v1/risk/calculate", json={"severity": 5, "likelihood": 5})
        assert res.status_code == 200
        assert res.json()["score"] == 25
        assert res.json()["level"] == "critical"
        assert res.json()["requires_immediate_alert"] is True

def test_report_lifecycle_and_audit_trail():
    with httpx.Client(base_url=BASE_URL) as client:
        # 1. Create Report
        form_data = {
            "reporter_code": "EMP-AUDIT",
            "reporter_name": "مختبر الجودة والتدقيق",
            "description": "فحص تكامل النظام: اختبار تسجيل بلاغ عالي الأثر مع التحقق من سجل التدقيق",
            "hazard_type": "electrical",
            "location_name": "محطة الاختبارات المركزية - مبنى A",
            "severity": 4,
            "likelihood": 4
        }
        res = client.post("/api/v1/reports", data=form_data)
        assert res.status_code == 201
        report = res.json()
        report_id = report["id"]
        assert report["report_number"].startswith("RPT-")
        assert report["risk_level"] == "high"
        assert report["status"] == "new"
        assert len(report["status_logs"]) >= 1

        # 2. Update status: new -> under_review
        res = client.patch(
            f"/api/v1/reports/{report_id}/status",
            json={
                "new_status": "under_review",
                "changed_by": "م. كريم عبد الرحمن",
                "comment": "تم فحص البلاغ ميدانياً والتأكد من خطورة الكابل",
                "assigned_to": "م. كريم عبد الرحمن"
            }
        )
        assert res.status_code == 200
        updated = res.json()
        assert updated["status"] == "under_review"
        assert updated["assigned_to"] == "م. كريم عبد الرحمن"
        assert len(updated["status_logs"]) >= 2
        assert updated["status_logs"][0]["new_status"] == "under_review"

        # 3. Update status: under_review -> resolved
        res = client.patch(
            f"/api/v1/reports/{report_id}/status",
            json={
                "new_status": "resolved",
                "changed_by": "م. كريم عبد الرحمن",
                "comment": "تم إصلاح العطل واستبدال الكابل بالكامل",
                "resolution_notes": "تم الانتهاء من العمل واختبار العزل"
            }
        )
        assert res.status_code == 200
        resolved = res.json()
        assert resolved["status"] == "resolved"
        assert resolved["resolved_at"] is not None
        assert len(resolved["status_logs"]) >= 3

def test_user_management():
    with httpx.Client(base_url=BASE_URL) as client:
        unique_code = f"TEST-{uuid.uuid4().hex[:4].upper()}"

        # 1. Create User
        user_payload = {
            "employee_code": unique_code,
            "full_name": "مستخدم تجريبي للاختبار",
            "email": f"{unique_code.lower()}@factory.local",
            "role": "worker",
            "department": "وحدة الفحص والاختبار"
        }
        res = client.post("/api/v1/users", json=user_payload)
        assert res.status_code == 201
        created_user = res.json()
        user_id = created_user["id"]
        assert created_user["employee_code"] == unique_code
        assert created_user["is_active"] is True

        # 2. Duplicate validation
        res_dup = client.post("/api/v1/users", json=user_payload)
        assert res_dup.status_code == 400

        # 3. Toggle active
        res_toggle = client.delete(f"/api/v1/users/{user_id}")
        assert res_toggle.status_code == 200
        assert res_toggle.json()["is_active"] is False

def test_dashboard_statistics():
    with httpx.Client(base_url=BASE_URL) as client:
        res = client.get("/api/v1/dashboard/stats")
        assert res.status_code == 200
        stats = res.json()
        assert stats["total_reports"] >= 1
        assert "by_hazard_type" in stats
        assert "by_risk_level" in stats
        assert "by_status" in stats
        assert len(stats["recent_trend"]) == 7

def test_authentication_and_worker_filter():
    with httpx.Client(base_url=BASE_URL) as client:
        # 1. Login Engineer (ENG-101)
        res_eng = client.post("/api/v1/auth/login", json={"employee_code": "ENG-101"})
        assert res_eng.status_code == 200
        eng_data = res_eng.json()
        assert eng_data["user"]["role"] == "engineer"
        assert eng_data["token"].startswith("demo-token-engineer")

        # 2. Login Admin (ADM-001)
        res_adm = client.post("/api/v1/auth/login", json={"employee_code": "ADM-001"})
        assert res_adm.status_code == 200
        adm_data = res_adm.json()
        assert adm_data["user"]["role"] == "admin"

        # 3. Invalid employee code
        res_invalid = client.post("/api/v1/auth/login", json={"employee_code": "NON-EXISTENT"})
        assert res_invalid.status_code == 401

        # 4. Filter reports by worker code
        res_worker_reports = client.get("/api/v1/reports?reporter_code=EMP-408")
        assert res_worker_reports.status_code == 200
        worker_reports = res_worker_reports.json()
        assert all(r["reporter_code"] == "EMP-408" for r in worker_reports)

