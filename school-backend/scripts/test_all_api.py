"""
Comprehensive API Test Script — Tests ALL backend endpoints
Run: python scripts/test_all_api.py
"""
import subprocess
import json
import sys
import time

BASE = "http://localhost:8000/api/v1"
COOKIE_FILE = "/tmp/test_cookies.txt"
results = {"pass": 0, "fail": 0, "tests": []}

def req(method, path, data=None, auth=True, expected_status=None):
    """Make an HTTP request and return (status_code, response_json)"""
    cmd = ["curl", "-s", "-w", "\n%{http_code}", "-b", COOKIE_FILE, "-c", COOKIE_FILE]
    
    if method == "POST":
        cmd.extend(["-X", "POST"])
    elif method == "PATCH":
        cmd.extend(["-X", "PATCH"])
    elif method == "DELETE":
        cmd.extend(["-X", "DELETE"])
    elif method == "GET":
        pass  # GET is default
    
    if data:
        cmd.extend(["-H", "Content-Type: application/json", "-d", json.dumps(data)])
    
    cmd.append(f"{BASE}{path}")
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
    output = result.stdout.strip()
    
    if not output:
        return 0, {"error": "No response"}
    
    # Extract status code (last line)
    parts = output.rsplit("\n", 1)
    if len(parts) == 2:
        body, status_str = parts
        try:
            status = int(status_str.strip())
        except ValueError:
            status = 0
        try:
            resp = json.loads(body) if body.strip() else {}
        except json.JSONDecodeError:
            resp = {"raw": body[:200]}
    else:
        status = 0
        resp = {"raw": output[:200]}
    
    if expected_status and status != expected_status:
        return status, resp
    
    return status, resp


def test(name, method, path, data=None, expected_status=None, check_key=None):
    """Run a single test and record the result"""
    status, resp = req(method, path, data, expected_status=expected_status)
    
    if expected_status and status != expected_status:
        results["fail"] += 1
        results["tests"].append((name, "FAIL", f"Expected {expected_status}, got {status}"))
        print(f"  ✗ FAIL: {name} — Expected {expected_status}, got {status}: {resp}")
        return resp
    
    # If checking for a specific key
    if check_key:
        if isinstance(resp, dict) and check_key in resp:
            results["pass"] += 1
            val = resp[check_key]
            print(f"  ✓ PASS: {name} ({check_key}={val})")
        elif isinstance(resp, list) and len(resp) >= 0:
            results["pass"] += 1
            print(f"  ✓ PASS: {name} (count={len(resp)})")
        else:
            results["fail"] += 1
            results["tests"].append((name, "FAIL", f"Missing key {check_key}"))
            print(f"  ✗ FAIL: {name} — Missing key '{check_key}': {resp}")
    else:
        results["pass"] += 1
        print(f"  ✓ PASS: {name} (HTTP {status})")
    
    return resp


def main():
    global results
    
    print("\n" + "=" * 60)
    print("  COMPREHENSIVE API TEST - ALL ENDPOINTS")
    print("=" * 60)
    
    # ─── Step 1: Auth & Health ───────────────────────────────────────────────
    print("\n─── AUTH & HEALTH ──────────────────────────────────────────")
    
    subprocess.run(["rm", "-f", COOKIE_FILE], capture_output=True)
    
    test("Health check", "GET", "/../health", expected_status=200)
    test("Root", "GET", "/../", expected_status=200)
    
    login_resp = test("Login", "POST", "/auth/login", 
                       data={"username": "admin", "password": "admin123!"},
                       expected_status=200, check_key="access_token")
    
    me_resp = test("GET /me", "GET", "/auth/me", expected_status=200, check_key="username")
    username = me_resp.get("username", "unknown") if isinstance(me_resp, dict) else "unknown"
    
    test("Refresh token", "POST", "/auth/refresh", expected_status=200, check_key="access_token")
    
    staff_resp = test("Register staff", "POST", "/auth/register",
                       data={"username": "staff_test", "email": "staff_test@school.edu",
                             "password": "staffpass123", "full_name": "Test Staff", "role": "staff"},
                       expected_status=201, check_key="username")
    
    # ─── Step 2: Students CRUD ───────────────────────────────────────────────
    print("\n─── STUDENTS ────────────────────────────────────────────────")
    
    s1 = test("Create Active Student", "POST", "/students",
               data={"first_name": "Ali", "last_name": "Khan", "cnic_bform": "34201-7654321-1",
                     "dob": "2015-05-15", "admission_date": "2025-09-01", "current_class": "5", "status": "active"},
               expected_status=201, check_key="id")
    
    s2 = test("Create 2nd Student", "POST", "/students",
               data={"first_name": "Sara", "last_name": "Ahmed", "cnic_bform": "35201-7654321-2",
                     "dob": "2016-03-20", "admission_date": "2025-09-01", "current_class": "4", "status": "active"},
               expected_status=201, check_key="id")
    
    s3 = test("Create Withdrawn Student", "POST", "/students",
               data={"first_name": "Bilal", "last_name": "Hussain", "cnic_bform": "37101-7654321-3",
                     "dob": "2014-11-10", "admission_date": "2024-09-01", "current_class": "6", "status": "withdrawn"},
               expected_status=201, check_key="id")
    
    s1_id = s1.get("id") if isinstance(s1, dict) else None
    
    test("List Students", "GET", "/students/", expected_status=200)
    test("Search Students", "GET", "/students/?search=ali", expected_status=200)
    test("Filter by Status", "GET", "/students/?status=withdrawn", expected_status=200)
    
    if s1_id:
        test("Get Student by ID", "GET", f"/students/{s1_id}", expected_status=200, check_key="id")
        test("Update Student", "PATCH", f"/students/{s1_id}",
              data={"current_class": "6"}, expected_status=200, check_key="current_class")
    
    # ─── Step 3: Parents CRUD ────────────────────────────────────────────────
    print("\n─── PARENTS ─────────────────────────────────────────────────")
    
    p1 = test("Create Parent", "POST", "/parents",
               data={"guardian_name": "Muhammad Tariq", "cnic": "35201-7654321-4",
                     "contact_no": "03001112233", "whatsapp_no": "03001112233", "address": "House 5, Lahore"},
               expected_status=201, check_key="id")
    
    p2 = test("Create 2nd Parent", "POST", "/parents",
               data={"guardian_name": "Fatima Bibi", "cnic": "35201-7654321-5",
                     "contact_no": "03004445566", "address": "House 10, Lahore"},
               expected_status=201, check_key="id")
    
    test("List Parents", "GET", "/parents/", expected_status=200)
    test("Search Parents", "GET", "/parents/?search=tariq", expected_status=200)
    
    p1_id = p1.get("id") if isinstance(p1, dict) else None
    if p1_id:
        test("Get Parent by ID", "GET", f"/parents/{p1_id}", expected_status=200, check_key="id")
        test("Update Parent", "PATCH", f"/parents/{p1_id}",
              data={"address": "House 15, Gulberg, Lahore"}, expected_status=200, check_key="address")
    
    # ─── Step 4: Link Students ↔ Parents ────────────────────────────────────
    print("\n─── STUDENT-PARENT LINKS ─────────────────────────────────────")
    
    if s1_id and p1_id:
        test("Link Parent to Student", "POST", f"/students/{s1_id}/parents",
              data={"parent_id": p1_id, "relationship": "Father"}, expected_status=201, check_key="id")
        test("Get Siblings", "GET", f"/students/{s1_id}/siblings", expected_status=200)
        test("Unlink Parent", "DELETE", f"/students/{s1_id}/parents/{p1_id}", expected_status=204)
        test("Re-link Parent", "POST", f"/students/{s1_id}/parents",
              data={"parent_id": p1_id, "relationship": "Father"}, expected_status=201, check_key="id")
    
    # ─── Step 5: Teachers CRUD ───────────────────────────────────────────────
    print("\n─── TEACHERS ────────────────────────────────────────────────")
    
    t1 = test("Create Teacher", "POST", "/teachers",
               data={"first_name": "Ayesha", "last_name": "Khan", "phone": "03001234567",
                     "subject": "Mathematics", "qualification": "M.Sc. Mathematics",
                     "hire_date": "2025-09-01", "salary": 80000, "address": "House 5, Lahore", "status": "active"},
               expected_status=201, check_key="id")
    
    t2 = test("Create 2nd Teacher", "POST", "/teachers",
               data={"first_name": "Muhammad", "last_name": "Ali", "phone": "03009876543",
                     "subject": "Physics", "qualification": "Ph.D. Physics",
                     "hire_date": "2024-03-15", "salary": 95000, "status": "active"},
               expected_status=201, check_key="id")
    
    t1_id = t1.get("id") if isinstance(t1, dict) else 1
    test("List Teachers", "GET", "/teachers/", expected_status=200)
    test("Search Teachers by Name", "GET", "/teachers/?search=ayesha", expected_status=200)
    test("Search Teachers by Subject", "GET", "/teachers/?search=physics", expected_status=200)
    
    if t1_id:
        test("Get Teacher by ID", "GET", f"/teachers/{t1_id}", expected_status=200, check_key="id")
        test("Update Teacher", "PATCH", f"/teachers/{t1_id}",
              data={"subject": "Advanced Math", "salary": 90000}, expected_status=200, check_key="subject")
    
    # ─── Step 6: Fee Types ──────────────────────────────────────────────────
    print("\n─── FEE TYPES ───────────────────────────────────────────────")
    
    f1 = test("Create Fee Type", "POST", "/fees",
               data={"fee_name": "Tuition Fee", "default_amount": 5000, "description": "Monthly tuition"},
               expected_status=201, check_key="id")
    
    f2 = test("Create 2nd Fee Type", "POST", "/fees",
               data={"fee_name": "Library Fee", "default_amount": 500, "description": "Annual library"},
               expected_status=201, check_key="id")
    
    test("List Fee Types", "GET", "/fees/", expected_status=200)
    
    f1_id = f1.get("id") if isinstance(f1, dict) else None
    if f1_id:
        test("Update Fee Type", "PATCH", f"/fees/{f1_id}",
              data={"default_amount": 5500}, expected_status=200, check_key="default_amount")
        
        test("Add Class Override", "POST", f"/fees/{f1_id}/overrides",
              data={"class_name": "5", "amount": 6000}, expected_status=201, check_key="id")
    
    # ─── Step 7: Invoices ───────────────────────────────────────────────────
    print("\n─── INVOICES ────────────────────────────────────────────────")
    
    if s1_id and f1_id and f2_id:
        inv = test("Create Invoice", "POST", "/invoices",
                    data={"student_id": s1_id, "billing_month": "2026-07",
                          "due_date": "2026-08-15",
                          "line_items": [
                              {"fee_type_id": f1_id, "amount": 5500},
                              {"fee_type_id": f2_id, "amount": 500}
                          ]},
                    expected_status=201, check_key="id")
        
        inv_id = inv.get("id") if isinstance(inv, dict) else None
        
        test("List Invoices", "GET", "/invoices/", expected_status=200)
        test("Filter Invoices by Student", "GET", f"/invoices/?student_id={s1_id}", expected_status=200)
        
        if inv_id:
            test("Get Invoice by ID", "GET", f"/invoices/{inv_id}", expected_status=200, check_key="id")
            test("Update Invoice Status", "PATCH", f"/invoices/{inv_id}/status",
                  data={"status": "overdue"}, expected_status=200, check_key="status")
            
            # ─── Step 8: Payments ──────────────────────────────────────────────
            print("\n─── PAYMENTS ──────────────────────────────────────────────")
            
            pay = test("Create Payment (partial)", "POST", "/payments",
                        data={"invoice_id": inv_id, "amount_paid": 3000, "payment_date": "2026-07-20",
                              "notes": "Partial payment"},
                        expected_status=201, check_key="id")
            
            pay2 = test("Create Payment (remaining)", "POST", "/payments",
                         data={"invoice_id": inv_id, "amount_paid": 3000, "payment_date": "2026-07-25",
                               "notes": "Full payment"},
                         expected_status=201, check_key="id")
            
            test("List Payments", "GET", "/payments/", expected_status=200)
            
            pay_id = pay.get("id") if isinstance(pay, dict) else None
            if pay_id:
                test("Delete/Void Payment", "DELETE", f"/payments/{pay_id}", expected_status=204)
    
    # ─── Step 9: Dashboard ───────────────────────────────────────────────────
    print("\n─── DASHBOARD ───────────────────────────────────────────────")
    
    test("Dashboard Stats", "GET", "/dashboard/stats", expected_status=200)
    test("Monthly Collections", "GET", "/dashboard/monthly-collections?months=3", expected_status=200)
    
    # ─── Step 10: User Management ─────────────────────────────────────────────
    print("\n─── USER MANAGEMENT ─────────────────────────────────────────")
    
    users_resp = test("List Users", "GET", "/users/", expected_status=200)
    
    if staff_resp and isinstance(staff_resp, dict):
        staff_id = staff_resp.get("id")
        if staff_id:
            test("Change User Role", "PATCH", f"/users/{staff_id}/role",
                  data={"role": "admin"}, expected_status=200, check_key="role")
    
    # ─── Step 11: Auth Protection ────────────────────────────────────────────
    print("\n─── AUTH PROTECTION (Unauthenticated) ───────────────────────")
    
    try:
        subprocess.run(["rm", "-f", COOKIE_FILE], capture_output=True)
    except:
        pass
    
    test("Students - No Auth", "GET", "/students/", expected_status=401)
    test("Parents - No Auth", "GET", "/parents/", expected_status=401)
    test("Teachers - No Auth", "GET", "/teachers/", expected_status=401)
    test("Fees - No Auth", "GET", "/fees/", expected_status=401)
    test("Invoices - No Auth", "GET", "/invoices/", expected_status=401)
    test("Payments - No Auth", "GET", "/payments/", expected_status=401)
    test("Dashboard - No Auth", "GET", "/dashboard/stats", expected_status=401)
    test("Users - No Auth", "GET", "/users/", expected_status=401)
    
    # ─── Summary ─────────────────────────────────────────────────────────────
    total = results["pass"] + results["fail"]
    print(f"\n{'=' * 60}")
    print(f"  RESULTS: {results['pass']}/{total} PASSED, {results['fail']} FAILED")
    print(f"{'=' * 60}")
    
    if results["fail"] > 0:
        print("\n  Failed tests:")
        for name, status, msg in results["tests"]:
            if status == "FAIL":
                print(f"    ✗ {name}: {msg}")
    
    return 0 if results["fail"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
