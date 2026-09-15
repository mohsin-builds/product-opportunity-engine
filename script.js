/* =========================================================
   MOHSIN LABS
   PRODUCT OPPORTUNITY ENGINE
   FINAL CLEAN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPERS
    ====================================================== */

    const byId = (id) => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.min(Math.max(value, min), max);

    const toNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const money = (value) => {
        if (!Number.isFinite(value)) return "N/A";

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const percent = (value) => {
        if (!Number.isFinite(value)) return "N/A";
        return `${value.toFixed(1)}%`;
    };

    function refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }


    /* =====================================================
       GOOGLE ANALYTICS 4
    ====================================================== */

    const analyticsState = {
        engineStarted: false,
        analysisTimer: null,
        lastVerdict: null
    };


    function trackEvent(
        eventName,
        parameters = {}
    ) {

        if (
            typeof window.gtag !== "function"
        ) {
            return;
        }

        window.gtag(
            "event",
            eventName,
            parameters
        );
    }


    function verdictKey(
        title
    ) {

        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    }


    function markEngineStarted() {

        if (
            analyticsState.engineStarted
        ) {
            return;
        }

        analyticsState.engineStarted =
            true;

        trackEvent(
            "engine_started",
            {
                marketplace:
                    inputs.marketplace.value
            }
        );
    }


    function trackCompletedAnalysis() {

        if (
            !analyticsState.engineStarted
        ) {
            return;
        }

        const values =
            getInputs();

        const economics =
            calculateEconomics(
                values
            );

        const stress =
            calculateStressTests(
                values
            );

        const score =
            calculateScore(
                economics,
                stress,
                values.sellingPrice
            );

        const verdict =
            getVerdict(
                score.total,
                economics,
                values.sellingPrice
            );

        const verdictName =
            verdictKey(
                verdict.title
            );

        trackEvent(
            "analysis_completed",
            {
                marketplace:
                    values.marketplace,

                opportunity_score:
                    score.total,

                profit_margin:
                    Number.isFinite(
                        economics.margin
                    )
                        ? Number(
                            economics.margin.toFixed(
                                1
                            )
                        )
                        : 0,

                roi:
                    Number.isFinite(
                        economics.roi
                    )
                        ? Number(
                            economics.roi.toFixed(
                                1
                            )
                        )
                        : 0,

                verdict:
                    verdictName
            }
        );


        if (
            analyticsState.lastVerdict !==
            verdictName
        ) {

            trackEvent(
                "opportunity_verdict",
                {
                    marketplace:
                        values.marketplace,

                    opportunity_score:
                        score.total,

                    verdict:
                        verdictName
                }
            );

            analyticsState.lastVerdict =
                verdictName;
        }
    }


    function scheduleAnalysisTracking() {

        if (
            !analyticsState.engineStarted
        ) {
            return;
        }

        window.clearTimeout(
            analyticsState.analysisTimer
        );

        analyticsState.analysisTimer =
            window.setTimeout(
                trackCompletedAnalysis,
                800
            );
    }


    /* =====================================================
       INPUT REFERENCES
    ====================================================== */

    const inputs = {
        marketplace: byId("marketplace"),
        sellingPrice: byId("sellingPrice"),
        supplierCost: byId("supplierCost"),
        shippingCost: byId("shippingCost"),
        marketplaceFee: byId("marketplaceFee"),
        paymentFee: byId("paymentFee"),
        riskAllowance: byId("riskAllowance"),
        otherCosts: byId("otherCosts")
    };

    const defaults = {
        marketplace: "amazon",
        sellingPrice: 29.99,
        supplierCost: 11,
        shippingCost: 4,
        marketplaceFee: 15,
        paymentFee: 2.9,
        riskAllowance: 1.5,
        otherCosts: 0
    };

    const marketplaceNames = {
        amazon: "Amazon",
        ebay: "eBay",
        shopify: "Shopify / Direct",
        other: "Other"
    };


    /* =====================================================
       READ INPUTS
    ====================================================== */

    function getInputs() {
        return {
            marketplace: inputs.marketplace.value,

            sellingPrice:
                Math.max(
                    0,
                    toNumber(inputs.sellingPrice.value)
                ),

            supplierCost:
                Math.max(
                    0,
                    toNumber(inputs.supplierCost.value)
                ),

            shippingCost:
                Math.max(
                    0,
                    toNumber(inputs.shippingCost.value)
                ),

            marketplaceFee:
                clamp(
                    toNumber(inputs.marketplaceFee.value),
                    0,
                    95
                ),

            paymentFee:
                clamp(
                    toNumber(inputs.paymentFee.value),
                    0,
                    95
                ),

            riskAllowance:
                Math.max(
                    0,
                    toNumber(inputs.riskAllowance.value)
                ),

            otherCosts:
                Math.max(
                    0,
                    toNumber(inputs.otherCosts.value)
                )
        };
    }


    /* =====================================================
       ECONOMICS ENGINE
    ====================================================== */

    function calculateEconomics(values) {

        const feeRate =
            (
                values.marketplaceFee +
                values.paymentFee
            ) / 100;

        const totalFeePercent =
            values.marketplaceFee +
            values.paymentFee;

        const fixedCosts =
            values.supplierCost +
            values.shippingCost +
            values.riskAllowance +
            values.otherCosts;

        const marketplaceFeeAmount =
            values.sellingPrice *
            (
                values.marketplaceFee /
                100
            );

        const paymentFeeAmount =
            values.sellingPrice *
            (
                values.paymentFee /
                100
            );

        const variableFees =
            marketplaceFeeAmount +
            paymentFeeAmount;

        const totalCost =
            fixedCosts +
            variableFees;

        const netProfit =
            values.sellingPrice -
            totalCost;

        const margin =
            values.sellingPrice > 0

                ? (
                    netProfit /
                    values.sellingPrice
                ) * 100

                : NaN;


        let roi;

        if (totalCost > 0) {

            roi =
                (
                    netProfit /
                    totalCost
                ) * 100;

        } else if (
            totalCost === 0 &&
            netProfit > 0
        ) {

            roi = Infinity;

        } else {

            roi = 0;

        }


        const breakEvenDenominator =
            1 -
            feeRate;

        const breakEvenPrice =
            breakEvenDenominator > 0

                ? fixedCosts /
                  breakEvenDenominator

                : Infinity;


        const safeDenominator =
            1 -
            feeRate -
            0.15;

        const safePrice =
            safeDenominator > 0

                ? fixedCosts /
                  safeDenominator

                : Infinity;


        const targetDenominator =
            1 -
            feeRate -
            0.25;

        const targetPrice =
            targetDenominator > 0

                ? fixedCosts /
                  targetDenominator

                : Infinity;


        const shippingRatio =
            values.sellingPrice > 0

                ? (
                    values.shippingCost /
                    values.sellingPrice
                ) * 100

                : Infinity;


        const priceBufferPercent =
            (
                Number.isFinite(
                    breakEvenPrice
                ) &&
                breakEvenPrice > 0
            )

                ? (
                    (
                        values.sellingPrice -
                        breakEvenPrice
                    ) /
                    breakEvenPrice
                ) * 100

                : 0;


        return {
            feeRate,
            totalFeePercent,
            fixedCosts,
            marketplaceFeeAmount,
            paymentFeeAmount,
            variableFees,
            totalCost,
            netProfit,
            margin,
            roi,
            breakEvenPrice,
            safePrice,
            targetPrice,
            shippingRatio,
            priceBufferPercent
        };
    }


    /* =====================================================
       STRESS TESTS
    ====================================================== */

    function calculateStressTests(values) {

        return {

            supplier:
                calculateEconomics(
                    {
                        ...values,

                        supplierCost:
                            values.supplierCost *
                            1.10
                    }
                ),

            shipping:
                calculateEconomics(
                    {
                        ...values,

                        shippingCost:
                            values.shippingCost *
                            1.20
                    }
                ),

            fees:
                calculateEconomics(
                    {
                        ...values,

                        marketplaceFee:
                            Math.min(
                                values.marketplaceFee + 3,
                                95
                            )
                    }
                ),

            returns:
                calculateEconomics(
                    {
                        ...values,

                        riskAllowance:
                            values.riskAllowance +
                            (
                                values.sellingPrice *
                                0.10
                            )
                    }
                )

        };
    }


    /* =====================================================
       OPPORTUNITY SCORE
    ====================================================== */

    function calculateScore(
        economics,
        stress,
        sellingPrice
    ) {

        /*
           Invalid commercial scenario:
           no selling price = no meaningful score.
        */

        if (
            sellingPrice <= 0
        ) {

            return {
                profitQuality: 0,
                priceResilience: 0,
                feeEfficiency: 0,
                logistics: 0,
                riskResilience: 0,
                total: 0
            };
        }


        /* -----------------------------------------
           1. PROFIT QUALITY /30
        ------------------------------------------ */

        let profitQuality = 0;

        if (
            economics.netProfit > 0
        ) {

            const marginPoints =
                clamp(
                    (
                        economics.margin /
                        35
                    ) * 18,
                    0,
                    18
                );

            const roiForScoring =
                Number.isFinite(
                    economics.roi
                )
                    ? economics.roi
                    : 1000;

            const roiPoints =
                clamp(
                    (
                        roiForScoring /
                        60
                    ) * 12,
                    0,
                    12
                );

            profitQuality =
                Math.round(
                    marginPoints +
                    roiPoints
                );
        }


        /* -----------------------------------------
           2. PRICE RESILIENCE /20
        ------------------------------------------ */

        let priceResilience = 0;

        const buffer =
            economics.priceBufferPercent;

        if (
            economics.netProfit <= 0
        ) {

            priceResilience = 0;

        } else if (
            buffer >= 40
        ) {

            priceResilience = 20;

        } else if (
            buffer >= 30
        ) {

            priceResilience = 17;

        } else if (
            buffer >= 20
        ) {

            priceResilience = 14;

        } else if (
            buffer >= 10
        ) {

            priceResilience = 9;

        } else if (
            buffer > 0
        ) {

            priceResilience = 4;

        }


        /* -----------------------------------------
           3. FEE EFFICIENCY /20
        ------------------------------------------ */

        let feeEfficiency = 0;

        const fees =
            economics.totalFeePercent;

        if (
            fees <= 8
        ) {

            feeEfficiency = 20;

        } else if (
            fees <= 12
        ) {

            feeEfficiency = 18;

        } else if (
            fees <= 16
        ) {

            feeEfficiency = 16;

        } else if (
            fees <= 20
        ) {

            feeEfficiency = 13;

        } else if (
            fees <= 25
        ) {

            feeEfficiency = 9;

        } else if (
            fees <= 30
        ) {

            feeEfficiency = 5;

        } else {

            feeEfficiency = 1;

        }


        /* -----------------------------------------
           4. LOGISTICS /15
        ------------------------------------------ */

        let logistics = 0;

        const shipping =
            economics.shippingRatio;

        if (
            !Number.isFinite(
                shipping
            )
        ) {

            logistics = 0;

        } else if (
            shipping <= 5
        ) {

            logistics = 15;

        } else if (
            shipping <= 10
        ) {

            logistics = 13;

        } else if (
            shipping <= 15
        ) {

            logistics = 11;

        } else if (
            shipping <= 20
        ) {

            logistics = 8;

        } else if (
            shipping <= 30
        ) {

            logistics = 4;

        } else {

            logistics = 1;

        }


        /* -----------------------------------------
           5. RISK RESILIENCE /15
        ------------------------------------------ */

        const scenarios = [
            stress.supplier,
            stress.shipping,
            stress.fees,
            stress.returns
        ];

        const profitableScenarios =
            scenarios.filter(
                scenario =>
                    scenario.netProfit > 0
            ).length;

        const worstMargin =
            Math.min(
                ...scenarios.map(
                    scenario =>
                        Number.isFinite(
                            scenario.margin
                        )
                            ? scenario.margin
                            : -Infinity
                )
            );

        let riskResilience =
            profitableScenarios *
            3;

        if (
            profitableScenarios === 4
        ) {

            riskResilience += 1;
        }

        if (
            worstMargin >= 20
        ) {

            riskResilience += 2;

        } else if (
            worstMargin >= 10
        ) {

            riskResilience += 1;
        }

        riskResilience =
            Math.round(
                clamp(
                    riskResilience,
                    0,
                    15
                )
            );


        /* -----------------------------------------
           TOTAL SCORE
        ------------------------------------------ */

        let total =
            profitQuality +
            priceResilience +
            feeEfficiency +
            logistics +
            riskResilience;


        if (
            economics.netProfit <= 0
        ) {

            total =
                Math.min(
                    total,
                    35
                );

        } else if (
            economics.margin < 5
        ) {

            total =
                Math.min(
                    total,
                    49
                );
        }


        total =
            Math.round(
                clamp(
                    total,
                    0,
                    100
                )
            );


        return {
            profitQuality,
            priceResilience,
            feeEfficiency,
            logistics,
            riskResilience,
            total
        };
    }


    /* =====================================================
       VERDICT
    ====================================================== */

    function getVerdict(
        total,
        economics,
        sellingPrice
    ) {

        if (
            sellingPrice <= 0 ||
            economics.netProfit <= 0
        ) {

            return {
                title: "WEAK OPPORTUNITY",
                icon: "❌"
            };
        }

        if (
            total >= 80
        ) {

            return {
                title: "STRONG PRODUCT TO TEST",
                icon: "🚀"
            };
        }

        if (
            total >= 65
        ) {

            return {
                title: "PROMISING OPPORTUNITY",
                icon: "✅"
            };
        }

        if (
            total >= 50
        ) {

            return {
                title: "NEEDS CAUTION",
                icon: "⚠️"
            };
        }

        return {
            title: "WEAK OPPORTUNITY",
            icon: "❌"
        };
    }


    /* =====================================================
       STRESS STATUS
    ====================================================== */

    function getStressStatus(
        scenario
    ) {

        if (
            scenario.netProfit <= 0
        ) {

            return {
                className: "status-warning",
                icon: "triangle-alert",
                text: "Losing money"
            };
        }

        if (
            scenario.margin < 10
        ) {

            return {
                className: "status-warning",
                icon: "triangle-alert",
                text: "Thin margin"
            };
        }

        if (
            scenario.margin < 20
        ) {

            return {
                className: "status-warning",
                icon: "triangle-alert",
                text:
                    `Margin ${scenario.margin.toFixed(0)}%`
            };
        }

        return {
            className: "status-good",
            icon: "circle-check",
            text: "Still profitable"
        };
    }


    /* =====================================================
       DECISION INTELLIGENCE
    ====================================================== */

    function buildIntelligence(
        values,
        economics,
        score
    ) {

        /*
           Zero selling price should be treated
           as incomplete input, not normal economics.
        */

        if (
            values.sellingPrice <= 0
        ) {

            return {

                strengths: [
                    "Cost structure is ready for evaluation"
                ],

                considerations: [
                    "Enter a selling price to evaluate profitability",
                    "Margin cannot be calculated without revenue",
                    "Pricing safety cannot be assessed yet"
                ],

                recommendation:
                    "Enter a selling price greater than $0 to generate a meaningful product opportunity analysis."

            };
        }


        const strengths = [];

        const considerations = [];


        if (
            economics.margin >= 25 &&
            economics.netProfit > 0
        ) {

            strengths.push(
                "Healthy profit margin"
            );

        } else {

            considerations.push(
                "Profit margin has room to improve"
            );
        }


        if (
            economics.roi >= 35 &&
            economics.netProfit > 0
        ) {

            strengths.push(
                "Strong return on invested cost"
            );

        } else if (
            economics.roi < 15
        ) {

            considerations.push(
                "Return on invested cost is relatively weak"
            );
        }


        if (
            economics.priceBufferPercent >= 20 &&
            economics.netProfit > 0
        ) {

            strengths.push(
                "Good pricing room above break-even"
            );

        } else {

            considerations.push(
                "Limited room above break-even"
            );
        }


        if (
            Number.isFinite(
                economics.shippingRatio
            ) &&
            economics.shippingRatio <= 15
        ) {

            strengths.push(
                "Shipping pressure is manageable"
            );

        } else {

            considerations.push(
                "Shipping consumes a large share of revenue"
            );
        }


        if (
            economics.totalFeePercent <= 18
        ) {

            strengths.push(
                "Marketplace and payment fees are manageable"
            );

        } else {

            considerations.push(
                "Combined fee pressure is relatively high"
            );
        }


        if (
            values.sellingPrice <
            economics.targetPrice &&
            Number.isFinite(
                economics.targetPrice
            )
        ) {

            considerations.push(
                `25% margin target requires about ${money(economics.targetPrice)}`
            );

        } else if (
            Number.isFinite(
                economics.targetPrice
            ) &&
            economics.netProfit > 0
        ) {

            strengths.push(
                "Current price clears the 25% target level"
            );
        }


        if (
            strengths.length === 0
        ) {

            strengths.push(
                "Clear baseline available for optimization"
            );
        }


        if (
            considerations.length === 0
        ) {

            considerations.push(
                "Continue monitoring supplier and fee changes"
            );
        }


        let recommendation;


        if (
            economics.netProfit <= 0
        ) {

            recommendation =
                Number.isFinite(
                    economics.breakEvenPrice
                )

                    ? `Current economics are unprofitable. Raise the selling price above ${money(economics.breakEvenPrice)} or reduce costs before testing.`

                    : "Current fee structure prevents viable break-even economics. Reduce fees or costs before testing.";

        } else if (
            score.total >= 80
        ) {

            recommendation =
                "Strong economic opportunity. Run a controlled product test before scaling.";

        } else if (
            score.total >= 65
        ) {

            recommendation =
                "Promising economics. Run a controlled test and monitor shipping, fees and return exposure closely.";

        } else if (
            score.total >= 50
        ) {

            recommendation =
                "Mixed opportunity. Improve sourcing cost, selling price or fee structure before committing meaningful capital.";

        } else {

            recommendation =
                "Weak product economics. Improve the cost structure or price positioning before testing.";
        }


        if (
            economics.netProfit > 0 &&
            values.sellingPrice <
            economics.targetPrice &&
            Number.isFinite(
                economics.targetPrice
            )
        ) {

            const allowableFixedCosts =
                values.sellingPrice *
                (
                    1 -
                    economics.feeRate -
                    0.25
                );

            const requiredReduction =
                Math.max(
                    0,
                    economics.fixedCosts -
                    allowableFixedCosts
                );

            if (
                requiredReduction > 0
            ) {

                recommendation +=
                    ` To reach a 25% margin at the current price, reduce fixed per-order costs by about ${money(requiredReduction)}, or raise the selling price toward ${money(economics.targetPrice)}.`;
            }
        }


        return {

            strengths:
                strengths.slice(
                    0,
                    5
                ),

            considerations:
                considerations.slice(
                    0,
                    5
                ),

            recommendation

        };
    }


    /* =====================================================
       MARKETPLACE FIT
    ====================================================== */

    function buildMarketplaceFit(
        values,
        economics,
        stress
    ) {

        const marketplaceName =
            marketplaceNames[
                values.marketplace
            ] ||
            "Selected Marketplace";


        /*
           No price = incomplete analysis.
        */

        if (
            values.sellingPrice <= 0
        ) {

            return [

                {
                    status: "danger",
                    text:
                        "Enter a selling price to evaluate unit economics"
                },

                {
                    status: "warning",
                    text:
                        "Margin cannot be evaluated yet"
                },

                {
                    status: "warning",
                    text:
                        "Pricing safety cannot be evaluated yet"
                },

                {
                    status: "warning",
                    text:
                        "Stress-test readiness is incomplete"
                },

                {
                    status: "info",
                    text:
                        `Marketplace selected: ${marketplaceName}`
                }

            ];
        }


        const items = [];


        /* UNIT ECONOMICS */

        if (
            economics.netProfit > 0
        ) {

            items.push({
                status: "positive",
                text: "Positive unit economics"
            });

        } else {

            items.push({
                status: "danger",
                text:
                    "Current unit economics are negative"
            });
        }


        /* MARGIN */

        if (
            economics.margin >= 20 &&
            economics.netProfit > 0
        ) {

            items.push({
                status: "positive",
                text:
                    "Healthy margin potential"
            });

        } else if (
            economics.margin > 0
        ) {

            items.push({
                status: "warning",
                text:
                    "Margin requires improvement"
            });

        } else {

            items.push({
                status: "danger",
                text:
                    "Margin is not commercially viable"
            });
        }


        /* PRICE BUFFER */

        if (
            economics.priceBufferPercent >= 15 &&
            economics.netProfit > 0
        ) {

            items.push({
                status: "positive",
                text:
                    "Useful pricing room above break-even"
            });

        } else if (
            economics.priceBufferPercent > 0
        ) {

            items.push({
                status: "warning",
                text:
                    "Limited pricing safety buffer"
            });

        } else {

            items.push({
                status: "danger",
                text:
                    "Selling price is below break-even"
            });
        }


        /* STRESS TEST */

        if (
            stress.supplier.netProfit > 0 &&
            stress.shipping.netProfit > 0
        ) {

            items.push({
                status: "positive",
                text:
                    "Survives supplier and shipping stress tests"
            });

        } else {

            items.push({
                status: "danger",
                text:
                    "Fails at least one supplier or shipping stress test"
            });
        }


        /* MARKETPLACE */

        items.push({
            status: "info",
            text:
                `Marketplace selected: ${marketplaceName}`
        });


        return items;
    }


    /* =====================================================
       RENDER HELPERS
    ====================================================== */

    function renderScorePart(
        barId,
        textId,
        value,
        maximum
    ) {

        const width =
            clamp(
                (
                    value /
                    maximum
                ) * 100,
                0,
                100
            );

        byId(
            barId
        ).style.width =
            `${width}%`;

        byId(
            textId
        ).textContent =
            `${value} / ${maximum}`;
    }


    function renderInsightList(
        element,
        items,
        icon
    ) {

        element.innerHTML =
            items
                .map(
                    item => `
                        <li>
                            <i data-lucide="${icon}"></i>
                            <span>${item}</span>
                        </li>
                    `
                )
                .join("");
    }


    function renderMarketplaceFit(
        element,
        items
    ) {

        const statusConfig = {

            positive: {
                icon: "circle-check",
                color: "#38e2ad"
            },

            warning: {
                icon: "triangle-alert",
                color: "#ffd34f"
            },

            danger: {
                icon: "circle-x",
                color: "#ff5b74"
            },

            info: {
                icon: "info",
                color: "#28a9ff"
            }

        };


        element.innerHTML =
            items
                .map(
                    item => {

                        const config =
                            statusConfig[
                                item.status
                            ] ||
                            statusConfig.info;

                        return `
                            <li>

                                <i
                                    data-lucide="${config.icon}"
                                    style="color:${config.color}"
                                ></i>

                                <span>
                                    ${item.text}
                                </span>

                            </li>
                        `;
                    }
                )
                .join("");
    }


    function renderStressRow(
        profitElement,
        statusElement,
        scenario
    ) {

        const status =
            getStressStatus(
                scenario
            );

        profitElement.textContent =
            `Profit: ${money(
                scenario.netProfit
            )}`;

        statusElement.className =
            status.className;

        statusElement.innerHTML = `
            <i data-lucide="${status.icon}"></i>
            ${status.text}
        `;
    }


    /* =====================================================
       RANGE VISUAL
    ====================================================== */

    function updateRangeVisual(
        range
    ) {

        const min =
            toNumber(
                range.min
            );

        const max =
            toNumber(
                range.max
            );

        const value =
            toNumber(
                range.value
            );

        const progress =
            max > min

                ? (
                    (
                        value -
                        min
                    ) /
                    (
                        max -
                        min
                    )
                ) * 100

                : 0;


        range.style.setProperty(
            "--range-fill",
            `${clamp(
                progress,
                0,
                100
            )}%`
        );
    }


    /* =====================================================
       MAIN UPDATE
    ====================================================== */

    function updateEngine() {

        const values =
            getInputs();

        const economics =
            calculateEconomics(
                values
            );

        const stress =
            calculateStressTests(
                values
            );

        const score =
            calculateScore(
                economics,
                stress,
                values.sellingPrice
            );

        const verdict =
            getVerdict(
                score.total,
                economics,
                values.sellingPrice
            );

        const intelligence =
            buildIntelligence(
                values,
                economics,
                score
            );

        const marketplaceFit =
            buildMarketplaceFit(
                values,
                economics,
                stress
            );


        /* -----------------------------------------
           ECONOMICS
        ------------------------------------------ */

        byId(
            "sellingPriceOutput"
        ).textContent =
            money(
                values.sellingPrice
            );

        byId(
            "totalCostOutput"
        ).textContent =
            money(
                economics.totalCost
            );

        byId(
            "netProfitOutput"
        ).textContent =
            money(
                economics.netProfit
            );

        byId(
            "profitMarginOutput"
        ).textContent =
            values.sellingPrice > 0

                ? percent(
                    economics.margin
                )

                : "N/A";

        byId(
            "roiOutput"
        ).textContent =
            Number.isFinite(
                economics.roi
            )

                ? percent(
                    economics.roi
                )

                : economics.netProfit > 0
                    ? "∞"
                    : "N/A";


        /* -----------------------------------------
           PRICE TARGETS
        ------------------------------------------ */

        byId(
            "breakEvenOutput"
        ).textContent =
            money(
                economics.breakEvenPrice
            );

        byId(
            "safePriceOutput"
        ).textContent =
            money(
                economics.safePrice
            );

        byId(
            "targetPriceOutput"
        ).textContent =
            money(
                economics.targetPrice
            );

        byId(
            "currentPriceOutput"
        ).textContent =
            money(
                values.sellingPrice
            );

        byId(
            "breakEvenLarge"
        ).textContent =
            money(
                economics.breakEvenPrice
            );

        byId(
            "safePriceLarge"
        ).textContent =
            money(
                economics.safePrice
            );

        byId(
            "targetPriceLarge"
        ).textContent =
            money(
                economics.targetPrice
            );


        /* -----------------------------------------
           SCORE
        ------------------------------------------ */

        byId(
            "opportunityScore"
        ).textContent =
            score.total;

        byId(
            "totalScoreBottom"
        ).textContent =
            score.total;

        byId(
            "scoreRing"
        ).style.setProperty(
            "--score",
            score.total
        );

        byId(
            "scoreVerdict"
        ).innerHTML = `
            ${verdict.title}
            <br>
            ${verdict.icon}
        `;


        renderScorePart(
            "profitScoreBar",
            "profitScoreText",
            score.profitQuality,
            30
        );

        renderScorePart(
            "resilienceScoreBar",
            "resilienceScoreText",
            score.priceResilience,
            20
        );

        renderScorePart(
            "feeScoreBar",
            "feeScoreText",
            score.feeEfficiency,
            20
        );

        renderScorePart(
            "logisticsScoreBar",
            "logisticsScoreText",
            score.logistics,
            15
        );

        renderScorePart(
            "riskScoreBar",
            "riskScoreText",
            score.riskResilience,
            15
        );


        /* -----------------------------------------
           STRESS
        ------------------------------------------ */

        renderStressRow(
            byId(
                "stressSupplierProfit"
            ),
            byId(
                "stressSupplierStatus"
            ),
            stress.supplier
        );

        renderStressRow(
            byId(
                "stressShippingProfit"
            ),
            byId(
                "stressShippingStatus"
            ),
            stress.shipping
        );

        renderStressRow(
            byId(
                "stressFeeProfit"
            ),
            byId(
                "stressFeeStatus"
            ),
            stress.fees
        );

        renderStressRow(
            byId(
                "stressReturnProfit"
            ),
            byId(
                "stressReturnStatus"
            ),
            stress.returns
        );


        /* -----------------------------------------
           INTELLIGENCE
        ------------------------------------------ */

        renderInsightList(
            byId(
                "strengthsList"
            ),
            intelligence.strengths,
            "circle-check"
        );

        renderInsightList(
            byId(
                "considerationsList"
            ),
            intelligence.considerations,
            "circle-alert"
        );

        byId(
            "recommendationText"
        ).textContent =
            intelligence.recommendation;


        /* -----------------------------------------
           MARKETPLACE FIT
        ------------------------------------------ */

        renderMarketplaceFit(
            byId(
                "marketplaceList"
            ),
            marketplaceFit
        );


        /* -----------------------------------------
           SIMULATOR LABELS
        ------------------------------------------ */

        byId(
            "simSupplierValue"
        ).textContent =
            money(
                values.supplierCost
            );

        byId(
            "simSellingValue"
        ).textContent =
            money(
                values.sellingPrice
            );

        byId(
            "simShippingValue"
        ).textContent =
            money(
                values.shippingCost
            );

        byId(
            "simMarketplaceFeeValue"
        ).textContent =
            `${values.marketplaceFee.toFixed(1)}%`;

        byId(
            "simRiskValue"
        ).textContent =
            money(
                values.riskAllowance
            );


        refreshIcons();
    }


    /* =====================================================
       MAIN INPUT ↔ RANGE SYNC
    ====================================================== */

    const microRanges =
        document.querySelectorAll(
            ".micro-range[data-sync]"
        );


    microRanges.forEach(
        range => {

            const input =
                byId(
                    range.dataset.sync
                );

            if (
                !input
            ) {
                return;
            }


            updateRangeVisual(
                range
            );


            range.addEventListener(
                "input",
                () => {

                    input.value =
                        range.value;

                    updateRangeVisual(
                        range
                    );

                    syncSimulatorFromInputs();

                    updateEngine();

                }
            );


            input.addEventListener(
                "input",
                () => {

                    range.value =
                        clamp(
                            toNumber(
                                input.value
                            ),
                            toNumber(
                                range.min
                            ),
                            toNumber(
                                range.max
                            )
                        );

                    updateRangeVisual(
                        range
                    );

                    syncSimulatorFromInputs();

                    updateEngine();

                }
            );

        }
    );


    /* =====================================================
       WHAT-IF SIMULATOR
    ====================================================== */

    const simulatorLinks = [

        {
            simulator:
                byId(
                    "simSupplier"
                ),

            input:
                inputs.supplierCost
        },

        {
            simulator:
                byId(
                    "simSelling"
                ),

            input:
                inputs.sellingPrice
        },

        {
            simulator:
                byId(
                    "simShipping"
                ),

            input:
                inputs.shippingCost
        },

        {
            simulator:
                byId(
                    "simMarketplaceFee"
                ),

            input:
                inputs.marketplaceFee
        },

        {
            simulator:
                byId(
                    "simRisk"
                ),

            input:
                inputs.riskAllowance
        }

    ];


    function syncTopRange(
        input
    ) {

        const range =
            document.querySelector(
                `.micro-range[data-sync="${input.id}"]`
            );

        if (
            !range
        ) {
            return;
        }


        range.value =
            clamp(
                toNumber(
                    input.value
                ),
                toNumber(
                    range.min
                ),
                toNumber(
                    range.max
                )
            );

        updateRangeVisual(
            range
        );
    }


    function syncSimulatorFromInputs() {

        simulatorLinks.forEach(
            link => {

                if (
                    !link.simulator ||
                    !link.input
                ) {
                    return;
                }


                link.simulator.value =
                    clamp(
                        toNumber(
                            link.input.value
                        ),
                        toNumber(
                            link.simulator.min
                        ),
                        toNumber(
                            link.simulator.max
                        )
                    );

                updateRangeVisual(
                    link.simulator
                );

            }
        );
    }


    simulatorLinks.forEach(
        link => {

            if (
                !link.simulator ||
                !link.input
            ) {
                return;
            }


            updateRangeVisual(
                link.simulator
            );


            link.simulator.addEventListener(
                "input",
                () => {

                    link.input.value =
                        link.simulator.value;

                    updateRangeVisual(
                        link.simulator
                    );

                    syncTopRange(
                        link.input
                    );

                    updateEngine();

                }
            );

        }
    );


    /* =====================================================
       MARKETPLACE CHANGE
    ====================================================== */

    if (
        inputs.marketplace
    ) {

        inputs.marketplace.addEventListener(
            "change",
            updateEngine
        );
    }


    /* =====================================================
       PREMIUM CUSTOM SELECT
    ====================================================== */

    function setupPremiumSelect(
        nativeSelect
    ) {

        if (
            !nativeSelect
        ) {
            return () => {};
        }


        nativeSelect.classList.add(
            "premium-native-select"
        );


        const shell =
            nativeSelect.closest(
                ".select-shell"
            );


        if (
            !shell
        ) {
            return () => {};
        }


        const trigger =
            document.createElement(
                "button"
            );

        trigger.type =
            "button";

        trigger.className =
            "premium-select-trigger";

        trigger.setAttribute(
            "aria-haspopup",
            "listbox"
        );

        trigger.setAttribute(
            "aria-expanded",
            "false"
        );


        const label =
            document.createElement(
                "span"
            );

        const chevron =
            document.createElement(
                "span"
            );

        chevron.className =
            "premium-select-chevron";

        trigger.append(
            label,
            chevron
        );


        const menu =
            document.createElement(
                "div"
            );

        menu.className =
            "premium-select-menu";

        menu.setAttribute(
            "role",
            "listbox"
        );


        const buttons = [];


        Array.from(
            nativeSelect.options
        ).forEach(
            option => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "premium-select-option";

                button.dataset.value =
                    option.value;

                button.textContent =
                    option.textContent;

                button.setAttribute(
                    "role",
                    "option"
                );


                button.addEventListener(
                    "click",
                    () => {

                        nativeSelect.value =
                            option.value;

                        nativeSelect.dispatchEvent(
                            new Event(
                                "change",
                                {
                                    bubbles:
                                        true
                                }
                            )
                        );

                        sync();

                        close();

                    }
                );


                buttons.push(
                    button
                );

                menu.appendChild(
                    button
                );

            }
        );


        shell.append(
            trigger,
            menu
        );


        function sync() {

            const selected =
                nativeSelect.options[
                    nativeSelect.selectedIndex
                ];

            label.textContent =
                selected?.textContent ||
                "Select Marketplace";


            buttons.forEach(
                button => {

                    const active =
                        button.dataset.value ===
                        nativeSelect.value;

                    button.classList.toggle(
                        "is-selected",
                        active
                    );

                    button.setAttribute(
                        "aria-selected",
                        active
                            ? "true"
                            : "false"
                    );

                }
            );
        }


        function open() {

            shell.classList.add(
                "premium-select-open"
            );

            trigger.setAttribute(
                "aria-expanded",
                "true"
            );
        }


        function close() {

            shell.classList.remove(
                "premium-select-open"
            );

            trigger.setAttribute(
                "aria-expanded",
                "false"
            );
        }


        trigger.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                shell.classList.contains(
                    "premium-select-open"
                )

                    ? close()

                    : open();

            }
        );


        menu.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            close
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    close();

                    trigger.focus();

                }

            }
        );


        nativeSelect.addEventListener(
            "change",
            sync
        );


        sync();

        return sync;
    }


    const syncPremiumSelect =
        setupPremiumSelect(
            inputs.marketplace
        );


    /* =====================================================
       ANALYTICS INTERACTIONS
    ====================================================== */

    const analyzerSection =
        byId(
            "analyzer"
        );


    if (
        analyzerSection
    ) {

        const handleAnalyzerInteraction =
            () => {

                markEngineStarted();

                scheduleAnalysisTracking();
            };


        analyzerSection.addEventListener(
            "input",
            handleAnalyzerInteraction
        );

        analyzerSection.addEventListener(
            "change",
            handleAnalyzerInteraction
        );
    }


    if (
        inputs.marketplace
    ) {

        inputs.marketplace.addEventListener(
            "change",
            () => {

                markEngineStarted();

                trackEvent(
                    "marketplace_selected",
                    {
                        marketplace:
                            inputs.marketplace.value
                    }
                );

                scheduleAnalysisTracking();
            }
        );
    }


    /* =====================================================
       RESET
    ====================================================== */

    const resetButton =
        byId(
            "resetInputs"
        );


    if (
        resetButton
    ) {

        resetButton.addEventListener(
            "click",
            () => {

                trackEvent(
                    "reset_clicked",
                    {
                        marketplace:
                            inputs.marketplace.value
                    }
                );

                Object.entries(
                    defaults
                ).forEach(
                    (
                        [
                            key,
                            value
                        ]
                    ) => {

                        if (
                            inputs[key]
                        ) {

                            inputs[key].value =
                                value;
                        }

                    }
                );


                microRanges.forEach(
                    range => {

                        const input =
                            byId(
                                range.dataset.sync
                            );

                        if (
                            !input
                        ) {
                            return;
                        }

                        range.value =
                            input.value;

                        updateRangeVisual(
                            range
                        );

                    }
                );


                syncSimulatorFromInputs();

                syncPremiumSelect();

                updateEngine();

            }
        );
    }


    /* =====================================================
       THEME BUTTON
    ====================================================== */

    const themeButton =
        byId(
            "themeButton"
        );


    if (
        themeButton
    ) {

        themeButton.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "deep-theme"
                );

                const deep =
                    document.body.classList.contains(
                        "deep-theme"
                    );


                themeButton.innerHTML = `
                    <i
                        data-lucide="${
                            deep
                                ? "sun"
                                : "moon"
                        }"
                    ></i>
                `;


                refreshIcons();

            }
        );
    }


    /* =====================================================
       SAFE PREMIUM SCROLL REVEAL
    ====================================================== */

    const revealItems =
        document.querySelectorAll(`
            .dashboard-card,
            .value-grid > div,
            .ecosystem-card
        `);


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (
        "IntersectionObserver" in window &&
        !reducedMotion
    ) {

        document.body.classList.add(
            "motion-ready"
        );


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            entry.target.classList.add(
                                "is-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }
                    );

                },
                {
                    threshold: 0.03,
                    rootMargin:
                        "0px 0px 80px 0px"
                }
            );


        revealItems.forEach(
            (
                item,
                index
            ) => {

                const rect =
                    item.getBoundingClientRect();

                if (
                    rect.top <
                    window.innerHeight *
                    1.15
                ) {

                    item.classList.add(
                        "is-visible"
                    );

                } else {

                    item.style.transitionDelay =
                        `${
                            (
                                index %
                                3
                            ) *
                            55
                        }ms`;

                    observer.observe(
                        item
                    );
                }

            }
        );


        /*
           Safety fallback:
           no real content can remain invisible.
        */

        window.setTimeout(
            () => {

                revealItems.forEach(
                    item => {

                        item.classList.add(
                            "is-visible"
                        );

                    }
                );

            },
            2200
        );

    } else {

        revealItems.forEach(
            item => {

                item.classList.add(
                    "is-visible"
                );

            }
        );
    }


    /* =====================================================
       INITIALIZE
    ====================================================== */

    syncSimulatorFromInputs();

    updateEngine();

    refreshIcons();

});