import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Debug "mo:core/Debug";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type Employee = {
    name : Text;
    email : Text;
    principal : Principal;
    isAdmin : Bool;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type Location = {
    latitude : Float;
    longitude : Float;
  };

  public type AttendanceRecord = {
    checkInTime : Time.Time;
    checkOutTime : ?Time.Time;
    location : Location;
  };

  public type AdminDebugInfo = {
    callerPrincipal : Text;
    callerIsAdmin : Bool;
    callerRole : Text;
    callerIsRegistered : Bool;
    callerEmployeeInfo : ?Employee;
    allAdminPrincipals : [Text];
    totalEmployees : Nat;
  };

  module AttendanceRecord {
    public func compare(r1 : AttendanceRecord, r2 : AttendanceRecord) : Order.Order {
      Int.compare(r1.checkInTime, r2.checkInTime);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let employees = Map.empty<Principal, Employee>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let attendance = Map.empty<Principal, List.List<AttendanceRecord>>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    Debug.print("=== getCallerUserProfile ===");
    Debug.print("Caller principal: " # caller.toText());

    let hasPermission = AccessControl.hasPermission(accessControlState, caller, #user);
    Debug.print("Has user permission: " # debug_show(hasPermission));

    if (not hasPermission) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    let profile = userProfiles.get(caller);
    Debug.print("Profile found: " # debug_show(profile != null));
    profile;
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    Debug.print("=== getUserProfile ===");
    Debug.print("Caller principal: " # caller.toText());
    Debug.print("Target user principal: " # user.toText());
    Debug.print("Caller equals target: " # debug_show(caller == user));

    let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("Caller is admin: " # debug_show(isCallerAdmin));

    if (caller != user and not isCallerAdmin) {
      Debug.print("Authorization failed: caller is not admin and not viewing own profile");
      Runtime.trap("Unauthorized: Can only view your own profile or be an admin");
    };

    let profile = userProfiles.get(user);
    Debug.print("Profile found: " # debug_show(profile != null));
    profile;
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    Debug.print("=== saveCallerUserProfile ===");
    Debug.print("Caller principal: " # caller.toText());
    Debug.print("Profile name: " # profile.name);
    Debug.print("Profile email: " # profile.email);

    let hasPermission = AccessControl.hasPermission(accessControlState, caller, #user);
    Debug.print("Has user permission: " # debug_show(hasPermission));

    if (not hasPermission) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    userProfiles.add(caller, profile);
    Debug.print("Profile saved successfully");
  };

  public shared ({ caller }) func initializeAdmin(name : Text, email : Text) : async () {
    Debug.print("=== initializeAdmin ===");
    Debug.print("Caller principal: " # caller.toText());
    Debug.print("Admin name: " # name);
    Debug.print("Admin email: " # email);

    let adminEmployees = employees.entries().filter(func((_, emp)) { emp.isAdmin }).toArray();
    let hasExistingAdmin = adminEmployees.size() > 0;
    Debug.print("Has existing admin: " # debug_show(hasExistingAdmin));
    Debug.print("Number of existing admins: " # debug_show(adminEmployees.size()));

    if (hasExistingAdmin) {
      let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);
      Debug.print("Existing admin check - caller is admin: " # debug_show(isCallerAdmin));
      if (not isCallerAdmin) {
        Debug.print("Authorization failed: caller is not an existing admin");
        Runtime.trap("Unauthorized: Only admins can initialize new admins");
      };
    } else {
      Debug.print("First admin initialization - no authorization check required");
    };

    switch (employees.get(caller)) {
      case (?existingEmployee) {
        Debug.print("Employee already registered: " # existingEmployee.name);
        Runtime.trap("Employee already registered");
      };
      case (null) {
        Debug.print("Creating new admin employee");
        let admin : Employee = {
          name;
          email;
          principal = caller;
          isAdmin = true;
        };

        employees.add(caller, admin);
        Debug.print("Admin employee added to employees map");

        AccessControl.assignRole(accessControlState, caller, caller, #admin);
        Debug.print("Admin role assigned in AccessControl system to: " # caller.toText());

        let profile : UserProfile = { name; email };
        userProfiles.add(caller, profile);
        Debug.print("User profile created for admin");

        let verifyAdmin = AccessControl.isAdmin(accessControlState, caller);
        Debug.print("Verification - caller is now admin: " # debug_show(verifyAdmin));
      };
    };
  };

  public shared ({ caller }) func registerEmployee(name : Text, email : Text) : async () {
    Debug.print("=== registerEmployee ===");
    Debug.print("Caller principal: " # caller.toText());
    Debug.print("Employee name: " # name);
    Debug.print("Employee email: " # email);

    switch (employees.get(caller)) {
      case (?existingEmployee) {
        Debug.print("Employee already registered: " # existingEmployee.name);
        Runtime.trap("Employee already registered");
      };
      case (null) {
        Debug.print("Creating new employee");
        let employee : Employee = {
          name;
          email;
          principal = caller;
          isAdmin = false;
        };

        employees.add(caller, employee);
        Debug.print("Employee added to employees map");

        AccessControl.assignRole(accessControlState, caller, caller, #user);
        Debug.print("User role assigned in AccessControl system to: " # caller.toText());

        let profile : UserProfile = { name; email };
        userProfiles.add(caller, profile);
        Debug.print("User profile created for employee");

        let verifyUser = AccessControl.hasPermission(accessControlState, caller, #user);
        Debug.print("Verification - caller is now user: " # debug_show(verifyUser));
      };
    };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    Debug.print("=== isAdmin Query ===");
    Debug.print("Caller principal: " # caller.toText());

    let userRole = AccessControl.getUserRole(accessControlState, caller);
    Debug.print("Caller role from AccessControl: " # debug_show(userRole));

    let result = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("isAdmin result: " # debug_show(result));

    switch (employees.get(caller)) {
      case (?emp) {
        Debug.print("Employee found in employees map");
        Debug.print("Employee name: " # emp.name);
        Debug.print("Employee isAdmin flag: " # debug_show(emp.isAdmin));
      };
      case (null) {
        Debug.print("Employee NOT found in employees map");
      };
    };

    result;
  };

  public query ({ caller }) func getAdminDebugInfo() : async AdminDebugInfo {
    Debug.print("=== getAdminDebugInfo ===");
    Debug.print("Caller principal: " # caller.toText());

    let userRole = AccessControl.getUserRole(accessControlState, caller);
    let roleText = switch (userRole) {
      case (#admin) { "admin" };
      case (#user) { "user" };
      case (#guest) { "guest" };
    };
    Debug.print("Caller role: " # roleText);

    let callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("Caller is admin: " # debug_show(callerIsAdmin));

    let callerEmployee = employees.get(caller);
    let callerIsRegistered = callerEmployee != null;
    Debug.print("Caller is registered: " # debug_show(callerIsRegistered));

    let allAdmins = employees.entries()
      .filter(func((_, emp)) { emp.isAdmin })
      .map(func((principal, emp)) {
        Debug.print("Admin found: " # principal.toText() # " (" # emp.name # ")");
        principal.toText();
      })
      .toArray();
    Debug.print("Total admins found: " # debug_show(allAdmins.size()));

    let callerMatchesAdmin = allAdmins.any(func(adminText) {
      let matches = adminText == caller.toText();
      if (matches) {
        Debug.print("Caller matches admin principal: " # adminText);
      };
      matches;
    });
    Debug.print("Caller matches any admin principal: " # debug_show(callerMatchesAdmin));

    let totalEmployees = employees.size();
    Debug.print("Total employees: " # debug_show(totalEmployees));

    {
      callerPrincipal = caller.toText();
      callerIsAdmin = callerIsAdmin;
      callerRole = roleText;
      callerIsRegistered = callerIsRegistered;
      callerEmployeeInfo = callerEmployee;
      allAdminPrincipals = allAdmins;
      totalEmployees = totalEmployees;
    };
  };

  public shared ({ caller }) func checkIn(latitude : Float, longitude : Float) : async () {
    Debug.print("=== checkIn ===");
    Debug.print("Caller principal: " # caller.toText());
    Debug.print("Location - Latitude: " # debug_show(latitude) # ", Longitude: " # debug_show(longitude));

    let hasPermission = AccessControl.hasPermission(accessControlState, caller, #user);
    Debug.print("Has user permission: " # debug_show(hasPermission));

    if (not hasPermission) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only registered users can check in");
    };

    switch (employees.get(caller)) {
      case (?employee) {
        Debug.print("Employee found: " # employee.name);
        let currentTime = Time.now();
        Debug.print("Check-in time: " # debug_show(currentTime));

        let location : Location = { latitude; longitude };
        let record : AttendanceRecord = {
          checkInTime = currentTime;
          checkOutTime = null;
          location;
        };

        let existingRecords = switch (attendance.get(caller)) {
          case (null) {
            Debug.print("No existing attendance records");
            List.empty<AttendanceRecord>();
          };
          case (?records) {
            Debug.print("Found existing attendance records");
            records;
          };
        };

        existingRecords.add(record);
        attendance.add(caller, existingRecords);
        Debug.print("Attendance record added successfully");
      };
      case (null) {
        Debug.print("Employee not found in employees map");
        Runtime.trap("Employee not registered");
      };
    };
  };

  public shared ({ caller }) func checkOut() : async () {
    Debug.print("=== checkOut ===");
    Debug.print("Caller principal: " # caller.toText());

    let hasPermission = AccessControl.hasPermission(accessControlState, caller, #user);
    Debug.print("Has user permission: " # debug_show(hasPermission));

    if (not hasPermission) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only registered users can check out");
    };

    switch (attendance.get(caller)) {
      case (null) {
        Debug.print("No attendance records found");
        Runtime.trap("No attendance record found for check-out");
      };
      case (?records) {
        Debug.print("Found attendance records");
        let currentTime = Time.now();
        let today = currentTime / (24 * 60 * 60 * 1_000_000_000);
        Debug.print("Current time: " # debug_show(currentTime));
        Debug.print("Today (day number): " # debug_show(today));

        var recordsUpdated = false;
        let updatedRecords = records.map<AttendanceRecord, AttendanceRecord>(
          func(record) {
            let checkInDay = record.checkInTime / (24 * 60 * 60 * 1_000_000_000);
            if (record.checkOutTime == null and checkInDay == today) {
              Debug.print("Updating record - Check-in time: " # debug_show(record.checkInTime));
              recordsUpdated := true;
              {
                checkInTime = record.checkInTime;
                checkOutTime = ?currentTime;
                location = record.location;
              };
            } else {
              record;
            };
          }
        );

        if (recordsUpdated) {
          attendance.add(caller, updatedRecords);
          Debug.print("Attendance record updated with check-out time");
        } else {
          Debug.print("No matching record found to update");
        };
      };
    };
  };

  public query ({ caller }) func getMonthlyReport(employeeId : Principal, year : Nat, month : Nat) : async [AttendanceRecord] {
    Debug.print("=== getMonthlyReport ===");
    Debug.print("Caller principal: " # caller.toText());
    Debug.print("Employee ID: " # employeeId.toText());
    Debug.print("Year: " # debug_show(year) # ", Month: " # debug_show(month));

    let hasUserPermission = AccessControl.hasPermission(accessControlState, caller, #user);
    Debug.print("Has user permission: " # debug_show(hasUserPermission));

    if (not hasUserPermission) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only registered users can access attendance records");
    };

    let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isViewingOwnRecords = caller == employeeId;
    Debug.print("Caller is admin: " # debug_show(isCallerAdmin));
    Debug.print("Viewing own records: " # debug_show(isViewingOwnRecords));

    if (not isViewingOwnRecords and not isCallerAdmin) {
      Debug.print("Authorization failed: not viewing own records and not admin");
      Runtime.trap("Unauthorized: Access denied to other employee's records");
    };

    switch (attendance.get(employeeId)) {
      case (null) {
        Debug.print("No attendance records found for employee");
        [];
      };
      case (?records) {
        Debug.print("Found attendance records, filtering by month");
        let filteredRecords = records.filter(
          func(record) { isSameMonth(record.checkInTime, year, month) }
        );
        let recordCount = filteredRecords.size();
        Debug.print("Filtered records count: " # debug_show(recordCount));
        let sortedRecords = filteredRecords.toArray().sort();
        sortedRecords;
      };
    };
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    Debug.print("=== getAllEmployees ===");
    Debug.print("Caller principal: " # caller.toText());

    let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("Caller is admin: " # debug_show(isCallerAdmin));

    if (not isCallerAdmin) {
      Debug.print("Authorization failed: caller is not admin");
      Runtime.trap("Unauthorized: Only admins can view all employees");
    };

    let allEmployees = employees.entries().map(func((_, emp)) { emp }).toArray();
    Debug.print("Total employees returned: " # debug_show(allEmployees.size()));
    allEmployees;
  };

  func isSameMonth(timestamp : Time.Time, year : Nat, month : Nat) : Bool {
    let timeSystem = module {
      func isLeapYear(year : Nat) : Bool {
        (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0);
      };

      func daysInYear(year : Nat) : Nat {
        if (isLeapYear(year)) { 366 } else { 365 };
      };

      func daysInMonth(month : Nat, isLeap : Bool) : Nat {
        switch (month) {
          case (1) { if (isLeap) { 29 } else { 28 } };
          case (3 or 5 or 8 or 10) { 30 };
          case (0 or 2 or 4 or 6 or 7 or 9 or 11) { 31 };
          case (_) { 0 };
        };
      };

      public func convertTime64ToDate(totalDays : Nat) : (Nat, Nat, Nat) {
        var daysRemaining = totalDays;
        var year = 1970;

        while (daysRemaining >= daysInYear(year)) {
          daysRemaining -= daysInYear(year);
          year += 1;
        };

        var month : Nat = 0;
        let leap : Bool = isLeapYear(year);
        while (daysRemaining >= daysInMonth(month, leap)) {
          daysRemaining -= daysInMonth(month, leap);
          month += 1;
        };

        (year, month + 1, daysRemaining + 1);
      };
    };

    let daysSinceUnixEpoch : Nat = ((timestamp / (24 * 60 * 60 * 1_000_000_000)).toNat());
    let (recordYear, recordMonth, _) = timeSystem.convertTime64ToDate(
      daysSinceUnixEpoch
    );

    recordYear == year and recordMonth == month;
  };
};
