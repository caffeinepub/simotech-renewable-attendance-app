import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    longitude: number;
}
export type Time = bigint;
export interface AdminDebugInfo {
    totalEmployees: bigint;
    callerIsRegistered: boolean;
    callerRole: string;
    callerEmployeeInfo?: Employee;
    callerIsAdmin: boolean;
    callerPrincipal: string;
    allAdminPrincipals: Array<string>;
}
export interface Employee {
    principal: Principal;
    name: string;
    email: string;
    isAdmin: boolean;
}
export interface AttendanceRecord {
    checkInTime: Time;
    checkOutTime?: Time;
    location: Location;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkIn(latitude: number, longitude: number): Promise<void>;
    checkOut(): Promise<void>;
    getAdminDebugInfo(): Promise<AdminDebugInfo>;
    getAllEmployees(): Promise<Array<Employee>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMonthlyReport(employeeId: Principal, year: bigint, month: bigint): Promise<Array<AttendanceRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAdmin(name: string, email: string): Promise<void>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    registerEmployee(name: string, email: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
