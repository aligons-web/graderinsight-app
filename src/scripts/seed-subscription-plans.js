"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var schema_1 = require("../../shared/schema");
var DATABASE_URL = process.env.GRADER_DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ GRADER_DATABASE_URL is not set');
    process.exit(1);
}
var sql = (0, postgres_1.default)(DATABASE_URL);
var db = (0, postgres_js_1.drizzle)(sql);
function seedSubscriptionPlans() {
    return __awaiter(this, void 0, void 0, function () {
        var plans, existingPlans, _i, plans_1, plan, priceDisplay, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Seeding subscription plans with analytics features...\n');
                    plans = [
                        {
                            name: 'Free',
                            tier: 'free',
                            priceCents: 0,
                            features: {
                                custom_rubrics: false,
                                ai_grading: false,
                                anonymizer_app: false,
                                user_dashboard: false,
                                analytics_dashboard: false,
                                error_tracking: false,
                                academic_integrity_tracking: false,
                                max_rubrics: 3,
                                max_monthly_uploads: 10,
                            },
                        },
                        {
                            name: 'Trial',
                            tier: 'trial',
                            priceCents: 0,
                            billingPeriod: '7_days',
                            features: {
                                custom_rubrics: true,
                                ai_grading: true,
                                anonymizer_app: true,
                                user_dashboard: true,
                                analytics_dashboard: true,
                                error_tracking: true,
                                academic_integrity_tracking: true,
                                max_rubrics: 10,
                                max_monthly_uploads: 100,
                            },
                        },
                        {
                            name: 'Basic',
                            tier: 'basic',
                            priceCents: 999,
                            billingPeriod: 'month',
                            features: {
                                custom_rubrics: true,
                                ai_grading: true,
                                anonymizer_app: false,
                                user_dashboard: false,
                                analytics_dashboard: false,
                                error_tracking: false,
                                academic_integrity_tracking: false,
                                max_rubrics: 50,
                                max_monthly_uploads: 200,
                            },
                        },
                        {
                            name: 'Pro',
                            tier: 'pro',
                            priceCents: 1999,
                            billingPeriod: 'month',
                            features: {
                                custom_rubrics: true,
                                ai_grading: true,
                                anonymizer_app: true,
                                user_dashboard: false,
                                analytics_dashboard: false,
                                error_tracking: false,
                                academic_integrity_tracking: false,
                                max_rubrics: 100,
                                max_monthly_uploads: 500,
                            },
                        },
                        {
                            name: 'Plus',
                            tier: 'plus',
                            priceCents: 2999,
                            billingPeriod: 'month',
                            features: {
                                custom_rubrics: true,
                                ai_grading: true,
                                anonymizer_app: true,
                                user_dashboard: true,
                                analytics_dashboard: true,
                                error_tracking: true,
                                academic_integrity_tracking: true,
                                max_rubrics: null,
                                max_monthly_uploads: 1500,
                            },
                        },
                        {
                            name: 'Admin',
                            tier: 'admin',
                            priceCents: 0,
                            features: {
                                custom_rubrics: true,
                                ai_grading: true,
                                anonymizer_app: true,
                                user_dashboard: true,
                                analytics_dashboard: true,
                                error_tracking: true,
                                academic_integrity_tracking: true,
                                admin_user_management: true,
                                admin_subscription_management: true,
                                admin_system_settings: true,
                                admin_audit_logs: true,
                                max_rubrics: null,
                                max_monthly_uploads: null,
                            },
                        },
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 10]);
                    return [4 /*yield*/, db.select().from(schema_1.subscriptionPlans)];
                case 2:
                    existingPlans = _a.sent();
                    if (existingPlans.length > 0) {
                        console.log('⚠️  Plans already exist. To update, delete existing plans first.');
                        console.log('   Run this SQL in Supabase to clear plans:');
                        console.log('   DELETE FROM subscription_plans;\n');
                        return [2 /*return*/];
                    }
                    _i = 0, plans_1 = plans;
                    _a.label = 3;
                case 3:
                    if (!(_i < plans_1.length)) return [3 /*break*/, 6];
                    plan = plans_1[_i];
                    return [4 /*yield*/, db.insert(schema_1.subscriptionPlans).values(plan)];
                case 4:
                    _a.sent();
                    priceDisplay = plan.priceCents === 0
                        ? 'Free'
                        : "$".concat((plan.priceCents / 100).toFixed(2)).concat(plan.billingPeriod ? '/' + plan.billingPeriod : '');
                    console.log("\u2705 Successfully seeded subscription plans:");
                    console.log("\uD83D\uDCE6 ".concat(plan.name, " (").concat(plan.tier, "): ").concat(priceDisplay));
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('\n🎉 Seed completed!');
                    return [3 /*break*/, 10];
                case 7:
                    error_1 = _a.sent();
                    console.error('❌ Error seeding plans:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, sql.end()];
                case 9:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
seedSubscriptionPlans();
