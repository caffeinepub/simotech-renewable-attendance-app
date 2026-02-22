import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Debug "mo:core/Debug";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Employee type
  public type Employee = {
    name : Text;
    email : Text;
    principal : Principal;
    isAdmin : Bool;
  };

  // User Profile type (required by frontend)
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  // Location type
  public type Location = {
    latitude : Float;
    longitude : Float;
  };

  // Attendance record type
  public type AttendanceRecord = {
    checkInTime : Time.Time;
    checkOutTime : ?Time.Time;
    location : Location;
  };

  let defaultAdminPrincipal = Principal.fromText("mhpch-6hb2j-phylo-7bgid-lmdtt-nd4to-wuert-h3mxk-4jz53-6meuu-iqe");

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent storage for employee records
  let employees = Map.empty<Principal, Employee>();

  // Persistent storage for user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Persistent storage for attendance records
  let attendance = Map.empty<Principal, List.List<AttendanceRecord>>();

  // Compare function for sorting records by checkInTime
  module AttendanceRecord {
    public func compare(r1 : AttendanceRecord, r2 : AttendanceRecord) : Order.Order {
      Int.compare(r1.checkInTime, r2.checkInTime);
    };
  };

  // Get caller's user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    Debug.print("getCallerUserProfile called by: " # caller.toText());
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get another user's profile (admin can view any, users can view their own)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    Debug.print("getUserProfile called by: " # caller.toText() # " for user: " # user.toText());
    
    // Users can view their own profile, admins can view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.print("Authorization failed: caller is not admin and not viewing own profile");
      Runtime.trap("Unauthorized: Can only view your own profile or be an admin");
    };
    userProfiles.get(user);
  };

  // Save caller's user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    Debug.print("saveCallerUserProfile called by: " # caller.toText());
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Initialize admin employee (admin-only, can only be called by existing admin or during first initialization)
  public shared ({ caller }) func initializeAdmin(name : Text, email : Text) : async () {
    Debug.print("initializeAdmin called by: " # caller.toText());
    
    // Check if this is the first admin initialization
    let hasExistingAdmin = employees.entries().any(func((_, emp)) { emp.isAdmin });

    if (hasExistingAdmin) {
      // If admin exists, only existing admin can create new admins
      let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);
      Debug.print("Existing admin check - caller is admin: " # debug_show(isCallerAdmin));
      if (not isCallerAdmin) {
        Runtime.trap("Unauthorized: Only admins can initialize new admins");
      };
    } else {
      // First admin must be the default admin principal
      Debug.print("First admin initialization - checking if caller is default admin");
      if (caller != defaultAdminPrincipal) {
        Runtime.trap("Unauthorized: First admin must be the default admin principal");
      };
    };

    // Check if caller is already registered
    switch (employees.get(caller)) {
      case (?_) { Runtime.trap("Employee already registered") };
      case (null) {
        let admin : Employee = {
          name;
          email;
          principal = caller;
          isAdmin = true;
        };

        employees.add(caller, admin);

        // Assign admin role in AccessControl system
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
        Debug.print("Admin role assigned to: " # caller.toText());

        // Also save as user profile
        let profile : UserProfile = { name; email };
        userProfiles.add(caller, profile);
      };
    };
  };

  // Register new employee (self-registration, automatically gets user role)
  public shared ({ caller }) func registerEmployee(name : Text, email : Text) : async () {
    Debug.print("registerEmployee called by: " # caller.toText());
    switch (employees.get(caller)) {
      case (?_) { Runtime.trap("Employee already registered") };
      case (null) {
        let employee : Employee = {
          name;
          email;
          principal = caller;
          isAdmin = false;
        };

        employees.add(caller, employee);

        // Assign user role in AccessControl system
        AccessControl.assignRole(accessControlState, caller, caller, #user);
        Debug.print("User role assigned to: " # caller.toText());

        // Also save as user profile
        let profile : UserProfile = { name; email };
        userProfiles.add(caller, profile);
      };
    };
  };

  // Check if caller is an admin (public query, no auth needed)
  public query ({ caller }) func isAdmin() : async Bool {
    Debug.print("isAdmin called by: " # caller.toText());
    let result = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("isAdmin result for " # caller.toText() # ": " # debug_show(result));
    result;
  };

  // Check-in and record attendance with location (user-only)
  public shared ({ caller }) func checkIn(latitude : Float, longitude : Float) : async () {
    Debug.print("checkIn called by: " # caller.toText());
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only registered users can check in");
    };

    switch (employees.get(caller)) {
      case (?_) {
        let currentTime = Time.now();
        let location : Location = { latitude; longitude };
        let record : AttendanceRecord = {
          checkInTime = currentTime;
          checkOutTime = null;
          location;
        };

        let existingRecords = switch (attendance.get(caller)) {
          case (null) { List.empty<AttendanceRecord>() };
          case (?records) { records };
        };

        existingRecords.add(record);
        attendance.add(caller, existingRecords);
      };
      case (null) {
        Runtime.trap("Employee not registered");
      };
    };
  };

  // Check-out and update attendance record (user-only)
  public shared ({ caller }) func checkOut() : async () {
    Debug.print("checkOut called by: " # caller.toText());
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only registered users can check out");
    };

    switch (attendance.get(caller)) {
      case (null) {
        Runtime.trap("No attendance record found for check-out");
      };
      case (?records) {
        // Find the last record from today without a check-out time
        let today = Time.now() / (24 * 60 * 60 * 1_000_000_000); // Calculate the current day in nanoseconds since epoch
        let updatedRecords = records.map<AttendanceRecord, AttendanceRecord>(
          func(record) {
            // Check if the check-in is from today and hasn't been checked out yet
            let checkInDay = record.checkInTime / (24 * 60 * 60 * 1_000_000_000);
            if (record.checkOutTime == null and checkInDay == today) {
              // Update the check-out time
              {
                checkInTime = record.checkInTime;
                checkOutTime = ?Time.now();
                location = record.location;
              };
            } else {
              record;
            };
          }
        );
        attendance.add(caller, updatedRecords);
      };
    };
  };

  // Generate monthly report for a given employee (admin can view all, users can view own)
  public query ({ caller }) func getMonthlyReport(employeeId : Principal, year : Nat, month : Nat) : async [AttendanceRecord] {
    Debug.print("getMonthlyReport called by: " # caller.toText() # " for employee: " # employeeId.toText());
    
    // Must be at least a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.print("Authorization failed: caller is not a user");
      Runtime.trap("Unauthorized: Only registered users can access attendance records");
    };

    // Check authorization: admin can view all, users can only view their own
    let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("Caller is admin: " # debug_show(isCallerAdmin));
    if (caller != employeeId and not isCallerAdmin) {
      Debug.print("Authorization failed: not viewing own records and not admin");
      Runtime.trap("Unauthorized: Access denied to other employee's records");
    };

    switch (attendance.get(employeeId)) {
      case (null) { [] };
      case (?records) {
        let filteredRecords = records.filter(
          func(record) { isSameMonth(record.checkInTime, year, month) }
        );
        // Sort the filtered records by checkInTime
        let sortedRecords = filteredRecords.toArray().sort();
        sortedRecords;
      };
    };
  };

  // Get all employees (admin-only)
  public query ({ caller }) func getAllEmployees() : async [Employee] {
    Debug.print("getAllEmployees called by: " # caller.toText());
    let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("Caller is admin: " # debug_show(isCallerAdmin));
    if (not isCallerAdmin) {
      Debug.print("Authorization failed: caller is not admin");
      Runtime.trap("Unauthorized: Only admins can view all employees");
    };

    employees.entries().map(func((_, emp)) { emp }).toArray();
  };

  // Helper function to check if timestamp is within specified month/year
  func isSameMonth(timestamp : Time.Time, year : Nat, month : Nat) : Bool {
    // Extract year and month from timestamp for comparison
    let timeSystem = module {
      func isLeapYear(year : Nat) : Bool {
        (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0);
      };

      func daysInYear(year : Nat) : Nat {
        if (isLeapYear(year)) { 366 } else { 365 };
      };

      func daysInMonth(month : Nat, isLeap : Bool) : Nat {
        // Assuming month is 0-indexed: 0 (January) to 11 (December)
        switch (month) {
          case (1) { if (isLeap) { 29 } else { 28 } }; // February
          case (3 or 5 or 8 or 10) { 30 }; // April, June, September, November
          case (0 or 2 or 4 or 6 or 7 or 9 or 11) { 31 }; // Other months
          case (_) { 0 }; // Should not occur
        };
      };

      public func convertTime64ToDate(totalDays : Nat) : (Nat, Nat, Nat) {
        var daysRemaining = totalDays;
        var year = 1970;

        // Get year
        while (daysRemaining >= daysInYear(year)) {
          daysRemaining -= daysInYear(year);
          year += 1;
        };

        // Determine month and day
        var month : Nat = 0;
        let leap : Bool = isLeapYear(year);
        while (daysRemaining >= daysInMonth(month, leap)) {
          daysRemaining -= daysInMonth(month, leap);
          month += 1;
        };

        // month is 0-indexed, day is 1-indexed
        (year, month + 1, daysRemaining + 1);
      };
    };

    // Convert timestamp to date components
    let daysSinceUnixEpoch : Nat = ((timestamp / (24 * 60 * 60 * 1_000_000_000)).toNat());
    let (recordYear, recordMonth, _) = timeSystem.convertTime64ToDate(
      daysSinceUnixEpoch
    );

    recordYear == year and recordMonth == month;
  };
};

