"use strict";

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       HELPERS
    ====================================================== */

    const $ = (id) =>
        document.getElementById(id);


    const clamp = (
        value,
        min,
        max
    ) =>
        Math.min(
            Math.max(value, min),
            max
        );


    const number = (value) => {

        const parsed =
            Number(value);

        return Number.isFinite(parsed)
            ? parsed
            : 0;

    };


    const money = (value) => {

        if (!Number.isFinite(value)) {
            return "N/A";
        }

        return new Intl.NumberFormat(
            "en-US",
            {
                style:
                    "currency",

                currency:
                    "USD",

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        ).format(value);

    };


    const percent = (value) => {

        if (!Number.isFinite(value)) {
            return "N/A";
        }

        return `${value.toFixed(1)}%`;

    };


    function refreshIcons() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
            "function"
        ) {

            window.lucide.createIcons();

        }

    }



    /* =====================================================
       ANALYTICS
    ====================================================== */

    const GA_ID =
        "G-VRW30YBDE9";


    const CONSENT_KEY =
        "mohsin_poe_analytics_consent";


    let analyticsLoaded =
        false;


    let engineStarted =
        false;


    let analysisTimer =
        null;


    let lastVerdict =
        "";


    function getConsent() {

        try {

            return localStorage.getItem(
                CONSENT_KEY
            );

        }

        catch {

            return null;

        }

    }


    function setConsent(value) {

        try {

            localStorage.setItem(
                CONSENT_KEY,
                value
            );

        }

        catch {
            return;
        }

    }


    function loadAnalytics() {

        if (
            analyticsLoaded ||
            getConsent() !== "granted"
        ) {
            return;
        }


        analyticsLoaded =
            true;


        window.dataLayer =
            window.dataLayer || [];


        window.gtag =
            window.gtag ||
            function () {

                window.dataLayer.push(
                    arguments
                );

            };


        const analyticsScript =
            document.createElement(
                "script"
            );


        analyticsScript.async =
            true;


        analyticsScript.src =
            `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;


        document.head.appendChild(
            analyticsScript
        );


        window.gtag(
            "js",
            new Date()
        );


        window.gtag(
            "config",
            GA_ID,
            {
                send_page_view:
                    true,

                linker: {
                    domains: [
                        "mohsinbuilds.com",
                        "mohsinlabs.com"
                    ]
                }
            }
        );

    }


    function trackEvent(
        name,
        parameters = {}
    ) {

        if (
            getConsent() === "granted" &&
            typeof window.gtag === "function"
        ) {

            window.gtag(
                "event",
                name,
                parameters
            );

        }

    }



    /* =====================================================
       CONSENT
    ====================================================== */

    const consentBanner =
        $("consentBanner");


    const acceptAnalytics =
        $("acceptAnalytics");


    const rejectAnalytics =
        $("rejectAnalytics");


    const cookieSettingsBtn =
        $("cookieSettingsBtn");


    function openConsent() {

        if (consentBanner) {
            consentBanner.hidden =
                false;
        }

    }


    function closeConsent() {

        if (consentBanner) {
            consentBanner.hidden =
                true;
        }

    }


    acceptAnalytics
        ?.addEventListener(
            "click",
            () => {

                setConsent(
                    "granted"
                );

                loadAnalytics();

                closeConsent();

            }
        );


    rejectAnalytics
        ?.addEventListener(
            "click",
            () => {

                setConsent(
                    "denied"
                );

                closeConsent();

            }
        );


    cookieSettingsBtn
        ?.addEventListener(
            "click",
            openConsent
        );


    const currentConsent =
        getConsent();


    if (
        currentConsent ===
        "granted"
    ) {

        loadAnalytics();

    }

    else if (
        currentConsent !==
        "denied"
    ) {

        openConsent();

    }



    /* =====================================================
       INPUT REFERENCES
    ====================================================== */

    const inputs = {

        marketplace:
            $("marketplace"),

        sellingPrice:
            $("sellingPrice"),

        supplierCost:
            $("supplierCost"),

        shippingCost:
            $("shippingCost"),

        marketplaceFee:
            $("marketplaceFee"),

        paymentFee:
            $("paymentFee"),

        riskAllowance:
            $("riskAllowance"),

        otherCosts:
            $("otherCosts")

    };


    const ranges = {

        sellingPrice:
            $("sellingPriceRange"),

        supplierCost:
            $("supplierCostRange"),

        shippingCost:
            $("shippingCostRange"),

        marketplaceFee:
            $("marketplaceFeeRange"),

        paymentFee:
            $("paymentFeeRange"),

        riskAllowance:
            $("riskAllowanceRange"),

        otherCosts:
            $("otherCostsRange")

    };


    const simulator = {

        supplier:
            $("simSupplier"),

        selling:
            $("simSelling"),

        shipping:
            $("simShipping"),

        marketplaceFee:
            $("simMarketplaceFee"),

        risk:
            $("simRisk")

    };


    const defaults = {

        marketplace:
            "amazon",

        sellingPrice:
            29.99,

        supplierCost:
            11,

        shippingCost:
            4,

        marketplaceFee:
            15,

        paymentFee:
            2.9,

        riskAllowance:
            1.5,

        otherCosts:
            0

    };


    const marketplaceNames = {

        amazon:
            "Amazon",

        ebay:
            "eBay",

        shopify:
            "Shopify / Direct",

        other:
            "Other"

    };



    /* =====================================================
       READ INPUTS
    ====================================================== */

    function getInputs() {

        return {

            marketplace:
                inputs.marketplace.value,

            sellingPrice:
                Math.max(
                    0,
                    number(
                        inputs.sellingPrice.value
                    )
                ),

            supplierCost:
                Math.max(
                    0,
                    number(
                        inputs.supplierCost.value
                    )
                ),

            shippingCost:
                Math.max(
                    0,
                    number(
                        inputs.shippingCost.value
                    )
                ),

            marketplaceFee:
                clamp(
                    number(
                        inputs.marketplaceFee.value
                    ),
                    0,
                    95
                ),

            paymentFee:
                clamp(
                    number(
                        inputs.paymentFee.value
                    ),
                    0,
                    95
                ),

            riskAllowance:
                Math.max(
                    0,
                    number(
                        inputs.riskAllowance.value
                    )
                ),

            otherCosts:
                Math.max(
                    0,
                    number(
                        inputs.otherCosts.value
                    )
                )

        };

    }



    /* =====================================================
       ECONOMICS ENGINE
    ====================================================== */

    function calculateEconomics(
        values
    ) {

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


        if (
            totalCost > 0
        ) {

            roi =
                (
                    netProfit /
                    totalCost
                ) * 100;

        }

        else if (
            totalCost === 0 &&
            netProfit > 0
        ) {

            roi =
                Infinity;

        }

        else {

            roi =
                0;

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

    function calculateStressTests(
        values
    ) {

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
                                values.marketplaceFee +
                                3,
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

        if (
            sellingPrice <= 0
        ) {

            return {

                profitQuality:
                    0,

                priceResilience:
                    0,

                feeEfficiency:
                    0,

                logistics:
                    0,

                riskResilience:
                    0,

                total:
                    0

            };

        }


        let profitQuality =
            0;


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


        let priceResilience =
            0;


        const buffer =
            economics.priceBufferPercent;


        if (
            economics.netProfit <= 0
        ) {

            priceResilience =
                0;

        }

        else if (
            buffer >= 40
        ) {

            priceResilience =
                20;

        }

        else if (
            buffer >= 30
        ) {

            priceResilience =
                17;

        }

        else if (
            buffer >= 20
        ) {

            priceResilience =
                14;

        }

        else if (
            buffer >= 10
        ) {

            priceResilience =
                9;

        }

        else if (
            buffer > 0
        ) {

            priceResilience =
                4;

        }


        let feeEfficiency =
            0;


        const fees =
            economics.totalFeePercent;


        if (
            fees <= 8
        ) {

            feeEfficiency =
                20;

        }

        else if (
            fees <= 12
        ) {

            feeEfficiency =
                18;

        }

        else if (
            fees <= 16
        ) {

            feeEfficiency =
                16;

        }

        else if (
            fees <= 20
        ) {

            feeEfficiency =
                13;

        }

        else if (
            fees <= 25
        ) {

            feeEfficiency =
                9;

        }

        else if (
            fees <= 30
        ) {

            feeEfficiency =
                5;

        }

        else {

            feeEfficiency =
                1;

        }


        let logistics =
            0;


        const shipping =
            economics.shippingRatio;


        if (
            !Number.isFinite(
                shipping
            )
        ) {

            logistics =
                0;

        }

        else if (
            shipping <= 5
        ) {

            logistics =
                15;

        }

        else if (
            shipping <= 10
        ) {

            logistics =
                13;

        }

        else if (
            shipping <= 15
        ) {

            logistics =
                11;

        }

        else if (
            shipping <= 20
        ) {

            logistics =
                8;

        }

        else if (
            shipping <= 30
        ) {

            logistics =
                4;

        }

        else {

            logistics =
                1;

        }


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

            riskResilience +=
                1;

        }


        if (
            worstMargin >= 20
        ) {

            riskResilience +=
                2;

        }

        else if (
            worstMargin >= 10
        ) {

            riskResilience +=
                1;

        }


        riskResilience =
            Math.round(
                clamp(
                    riskResilience,
                    0,
                    15
                )
            );


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

        }

        else if (
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
                title:
                    "WEAK OPPORTUNITY",

                icon:
                    "❌"
            };

        }


        if (
            total >= 80
        ) {

            return {
                title:
                    "STRONG PRODUCT TO TEST",

                icon:
                    "🚀"
            };

        }


        if (
            total >= 65
        ) {

            return {
                title:
                    "PROMISING OPPORTUNITY",

                icon:
                    "✅"
            };

        }


        if (
            total >= 50
        ) {

            return {
                title:
                    "NEEDS CAUTION",

                icon:
                    "⚠️"
            };

        }


        return {

            title:
                "WEAK OPPORTUNITY",

            icon:
                "❌"

        };

    }



    /* =====================================================
       STRESS STATUS
    ====================================================== */

    function stressStatus(
        economics
    ) {

        if (
            economics.netProfit <= 0
        ) {

            return {

                text:
                    "Losing money",

                className:
                    "danger"

            };

        }


        if (
            economics.margin < 20
        ) {

            return {

                text:
                    `Margin ${Math.max(
                        0,
                        economics.margin
                    ).toFixed(0)}%`,

                className:
                    "warning"

            };

        }


        return {

            text:
                "Still profitable",

            className:
                ""

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

        const strengths =
            [];


        const considerations =
            [];


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


        if (
            economics.margin >= 25 &&
            economics.netProfit > 0
        ) {

            strengths.push(
                "Healthy profit margin"
            );

        }

        else {

            considerations.push(
                "Profit margin could be stronger"
            );

        }


        if (
            economics.roi >= 30
        ) {

            strengths.push(
                "Strong return on invested cost"
            );

        }

        else {

            considerations.push(
                "ROI leaves limited room for cost changes"
            );

        }


        if (
            economics.priceBufferPercent >= 20
        ) {

            strengths.push(
                "Good pricing room above break-even"
            );

        }

        else {

            considerations.push(
                "Selling price is close to break-even"
            );

        }


        if (
            economics.shippingRatio <= 15
        ) {

            strengths.push(
                "Shipping pressure is manageable"
            );

        }

        else {

            considerations.push(
                "Shipping consumes a large share of revenue"
            );

        }


        if (
            economics.totalFeePercent <= 20
        ) {

            strengths.push(
                "Marketplace and payment fees are manageable"
            );

        }

        else {

            considerations.push(
                "Combined marketplace fees are relatively high"
            );

        }


        if (
            strengths.length === 0
        ) {

            strengths.push(
                "Scenario can still be improved through pricing or cost optimization"
            );

        }


        if (
            considerations.length === 0
        ) {

            considerations.push(
                "Continue monitoring supplier, shipping and return costs"
            );

        }


        let recommendation;


        if (
            score.total >= 80
        ) {

            recommendation =
                "Strong economics. Consider a controlled product test while validating demand, competition and marketplace requirements.";

        }

        else if (
            score.total >= 65
        ) {

            recommendation =
                "Promising economics. Run a controlled test and monitor shipping, fees and return exposure closely.";

        }

        else if (
            score.total >= 50
        ) {

            recommendation =
                "The numbers need caution. Improve price, sourcing or shipping before committing significant inventory.";

        }

        else {

            recommendation =
                "Current economics are weak. Rework pricing and costs before treating this as a viable product opportunity.";

        }


        return {

            strengths,
            considerations,
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

        const items =
            [];


        if (
            economics.netProfit > 0
        ) {

            items.push(
                "Positive unit economics"
            );

        }

        else {

            items.push(
                "Current unit economics are unprofitable"
            );

        }


        if (
            economics.margin >= 20
        ) {

            items.push(
                "Healthy margin potential"
            );

        }

        else {

            items.push(
                "Margin needs improvement"
            );

        }


        if (
            economics.priceBufferPercent >= 15
        ) {

            items.push(
                "Useful pricing room above break-even"
            );

        }

        else {

            items.push(
                "Limited room above break-even"
            );

        }


        const survivesStress =
            [
                stress.supplier,
                stress.shipping,
                stress.fees
            ]
            .every(
                item =>
                    item.netProfit > 0
            );


        items.push(
            survivesStress

                ? "Survives supplier and shipping stress tests"

                : "Some stress scenarios create losses"
        );


        items.push(
            `Marketplace selected: ${
                marketplaceNames[
                    values.marketplace
                ] ||
                "Other"
            }`
        );


        return items;

    }



    /* =====================================================
       SCORE BARS
    ====================================================== */

    function updateScoreLine(
        name,
        value,
        maximum
    ) {

        const bar =
            $(`${name}Bar`);


        const output =
            $(`${name}Score`);


        if (bar) {

            bar.style.width =
                `${
                    clamp(
                        value /
                        maximum *
                        100,
                        0,
                        100
                    )
                }%`;

        }


        if (output) {

            output.textContent =
                `${value} / ${maximum}`;

        }

    }



    /* =====================================================
       SAFETY MARKERS
    ====================================================== */

    function positionSafetyMarkers(
        values,
        economics
    ) {

        const allPrices =
            [
                economics.breakEvenPrice,
                economics.safePrice,
                economics.targetPrice,
                values.sellingPrice
            ]
            .filter(
                Number.isFinite
            );


        const maximum =
            Math.max(
                1,
                ...allPrices
            ) *
            1.08;


        const position =
            (price) =>
                `${
                    clamp(
                        (
                            price /
                            maximum
                        ) *
                        100,
                        2,
                        98
                    )
                }%`;


        if (
            Number.isFinite(
                economics.breakEvenPrice
            )
        ) {

            $("breakEvenMarker")
                .style.left =
                position(
                    economics.breakEvenPrice
                );

        }


        if (
            Number.isFinite(
                economics.safePrice
            )
        ) {

            $("safeMarker")
                .style.left =
                position(
                    economics.safePrice
                );

        }


        if (
            Number.isFinite(
                economics.targetPrice
            )
        ) {

            $("targetMarker")
                .style.left =
                position(
                    economics.targetPrice
                );

        }


        $("currentMarker")
            .style.left =
            position(
                values.sellingPrice
            );

    }



    /* =====================================================
       RENDER
    ====================================================== */

    function render() {

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


        /* SCORE */

        $("scoreValue").textContent =
            score.total;


        $("scoreBottom").textContent =
            score.total;


        $("verdictText").textContent =
            verdict.title;


        $("verdictIcon").textContent =
            verdict.icon;


        const circumference =
            2 *
            Math.PI *
            61;


        $("scoreRing").style.strokeDasharray =
            String(
                circumference
            );


        $("scoreRing").style.strokeDashoffset =
            String(
                circumference -
                (
                    score.total /
                    100
                ) *
                circumference
            );


        updateScoreLine(
            "profitQuality",
            score.profitQuality,
            30
        );


        updateScoreLine(
            "priceResilience",
            score.priceResilience,
            20
        );


        updateScoreLine(
            "feeEfficiency",
            score.feeEfficiency,
            20
        );


        updateScoreLine(
            "logistics",
            score.logistics,
            15
        );


        updateScoreLine(
            "riskResilience",
            score.riskResilience,
            15
        );


        /* ECONOMICS */

        $("sellingPriceOutput")
            .textContent =
            money(
                values.sellingPrice
            );


        $("totalCostOutput")
            .textContent =
            money(
                economics.totalCost
            );


        $("netProfitOutput")
            .textContent =
            money(
                economics.netProfit
            );


        $("marginOutput")
            .textContent =
            percent(
                economics.margin
            );


        $("roiOutput")
            .textContent =
            Number.isFinite(
                economics.roi
            )

                ? percent(
                    economics.roi
                )

                : "∞";


        $("netProfitOutput")
            .classList.toggle(
                "positive-text",
                economics.netProfit >= 0
            );


        $("netProfitOutput")
            .style.color =
            economics.netProfit >= 0

                ? "var(--green)"

                : "var(--red)";


        /* PRICE TARGETS */

        const breakEven =
            money(
                economics.breakEvenPrice
            );


        const safePrice =
            money(
                economics.safePrice
            );


        const targetPrice =
            money(
                economics.targetPrice
            );


        $("breakEvenOutput")
            .textContent =
            breakEven;


        $("safePriceOutput")
            .textContent =
            safePrice;


        $("targetPriceOutput")
            .textContent =
            targetPrice;


        $("yourPriceOutput")
            .textContent =
            money(
                values.sellingPrice
            );


        $("breakEvenLarge")
            .textContent =
            breakEven;


        $("safePriceLarge")
            .textContent =
            safePrice;


        $("targetPriceLarge")
            .textContent =
            targetPrice;


        positionSafetyMarkers(
            values,
            economics
        );


        /* STRESS */

        const stressItems =
            [
                {
                    id:
                        "Supplier",

                    economics:
                        stress.supplier
                },

                {
                    id:
                        "Shipping",

                    economics:
                        stress.shipping
                },

                {
                    id:
                        "Fees",

                    economics:
                        stress.fees
                },

                {
                    id:
                        "Returns",

                    economics:
                        stress.returns
                }
            ];


        stressItems.forEach(
            item => {

                const status =
                    stressStatus(
                        item.economics
                    );


                $(
                    `stress${item.id}Profit`
                ).textContent =
                    money(
                        item.economics.netProfit
                    );


                const statusElement =
                    $(
                        `stress${item.id}Status`
                    );


                statusElement.textContent =
                    status.text;


                statusElement.className =
                    status.className;

            }
        );


        /* INTELLIGENCE */

        $("strengthsList")
            .replaceChildren(
                ...intelligence
                    .strengths
                    .map(
                        text => {

                            const li =
                                document.createElement(
                                    "li"
                                );


                            li.textContent =
                                text;


                            return li;

                        }
                    )
            );


        $("considerationsList")
            .replaceChildren(
                ...intelligence
                    .considerations
                    .map(
                        text => {

                            const li =
                                document.createElement(
                                    "li"
                                );


                            li.textContent =
                                text;


                            return li;

                        }
                    )
            );


        $("recommendationText")
            .textContent =
            intelligence
                .recommendation;


        /* MARKETPLACE */

        $("marketplaceList")
            .replaceChildren(
                ...marketplaceFit.map(
                    text => {

                        const li =
                            document.createElement(
                                "li"
                            );


                        li.textContent =
                            text;


                        return li;

                    }
                )
            );


        /* SIMULATOR */

        simulator.supplier.value =
            String(
                values.supplierCost
            );


        simulator.selling.value =
            String(
                values.sellingPrice
            );


        simulator.shipping.value =
            String(
                values.shippingCost
            );


        simulator.marketplaceFee.value =
            String(
                values.marketplaceFee
            );


        simulator.risk.value =
            String(
                values.riskAllowance
            );


        $("simSupplierValue")
            .textContent =
            money(
                values.supplierCost
            );


        $("simSellingValue")
            .textContent =
            money(
                values.sellingPrice
            );


        $("simShippingValue")
            .textContent =
            money(
                values.shippingCost
            );


        $("simMarketplaceFeeValue")
            .textContent =
            percent(
                values.marketplaceFee
            );


        $("simRiskValue")
            .textContent =
            money(
                values.riskAllowance
            );


        scheduleAnalytics(
            values,
            economics,
            score,
            verdict
        );

    }



    /* =====================================================
       ANALYTICS EVENTS
    ====================================================== */

    function scheduleAnalytics(
        values,
        economics,
        score,
        verdict
    ) {

        if (
            !engineStarted
        ) {
            return;
        }


        clearTimeout(
            analysisTimer
        );


        analysisTimer =
            setTimeout(
                () => {

                    const verdictKey =
                        verdict.title
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9]+/g,
                                "_"
                            )
                            .replace(
                                /^_+|_+$/g,
                                ""
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
                                        economics.margin
                                            .toFixed(1)
                                    )

                                    : 0,

                            roi:
                                Number.isFinite(
                                    economics.roi
                                )

                                    ? Number(
                                        economics.roi
                                            .toFixed(1)
                                    )

                                    : 0,

                            verdict:
                                verdictKey
                        }
                    );


                    if (
                        lastVerdict !==
                        verdictKey
                    ) {

                        trackEvent(
                            "opportunity_verdict",
                            {
                                marketplace:
                                    values.marketplace,

                                opportunity_score:
                                    score.total,

                                verdict:
                                    verdictKey
                            }
                        );


                        lastVerdict =
                            verdictKey;

                    }

                },
                800
            );

    }



    /* =====================================================
       SYNC NORMAL INPUTS
    ====================================================== */

    function markStarted() {

        if (
            engineStarted
        ) {
            return;
        }


        engineStarted =
            true;


        trackEvent(
            "engine_started",
            {
                marketplace:
                    inputs.marketplace.value
            }
        );

    }


    Object.entries(
        inputs
    ).forEach(
        (
            [
                key,
                element
            ]
        ) => {

            if (
                key ===
                "marketplace"
            ) {

                element.addEventListener(
                    "change",
                    () => {

                        markStarted();

                        render();

                    }
                );


                return;

            }


            element.addEventListener(
                "input",
                () => {

                    markStarted();


                    if (
                        ranges[key]
                    ) {

                        ranges[key].value =
                            element.value;

                    }


                    render();

                }
            );

        }
    );



    /* =====================================================
       SYNC RANGE INPUTS
    ====================================================== */

    Object.entries(
        ranges
    ).forEach(
        (
            [
                key,
                range
            ]
        ) => {

            range.addEventListener(
                "input",
                () => {

                    markStarted();


                    inputs[key].value =
                        range.value;


                    render();

                }
            );

        }
    );



    /* =====================================================
       SIMULATOR
    ====================================================== */

    simulator.supplier
        .addEventListener(
            "input",
            () => {

                markStarted();

                inputs.supplierCost.value =
                    simulator.supplier.value;

                ranges.supplierCost.value =
                    simulator.supplier.value;

                render();

            }
        );


    simulator.selling
        .addEventListener(
            "input",
            () => {

                markStarted();

                inputs.sellingPrice.value =
                    simulator.selling.value;

                ranges.sellingPrice.value =
                    simulator.selling.value;

                render();

            }
        );


    simulator.shipping
        .addEventListener(
            "input",
            () => {

                markStarted();

                inputs.shippingCost.value =
                    simulator.shipping.value;

                ranges.shippingCost.value =
                    simulator.shipping.value;

                render();

            }
        );


    simulator.marketplaceFee
        .addEventListener(
            "input",
            () => {

                markStarted();

                inputs.marketplaceFee.value =
                    simulator
                        .marketplaceFee
                        .value;

                ranges.marketplaceFee.value =
                    simulator
                        .marketplaceFee
                        .value;

                render();

            }
        );


    simulator.risk
        .addEventListener(
            "input",
            () => {

                markStarted();

                inputs.riskAllowance.value =
                    simulator.risk.value;

                ranges.riskAllowance.value =
                    simulator.risk.value;

                render();

            }
        );



    /* =====================================================
       RESET
    ====================================================== */

    $("resetButton")
        .addEventListener(
            "click",
            () => {

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


                        if (
                            ranges[key]
                        ) {

                            ranges[key].value =
                                value;

                        }

                    }
                );


                engineStarted =
                    false;


                lastVerdict =
                    "";


                render();


                trackEvent(
                    "engine_reset"
                );

            }
        );



    /* =====================================================
       THEME
    ====================================================== */

    const themeButton =
        $("themeButton");


    const themeIcon =
        $("themeIcon");


    themeButton
        ?.addEventListener(
            "click",
            () => {

                document.body
                    .classList
                    .toggle(
                        "light-mode"
                    );


                const alternate =
                    document.body
                        .classList
                        .contains(
                            "light-mode"
                        );


                themeIcon.setAttribute(
                    "data-lucide",
                    alternate
                        ? "sun"
                        : "moon"
                );


                refreshIcons();

            }
        );



    /* =====================================================
       INIT
    ====================================================== */

    render();

    refreshIcons();


    window.addEventListener(
        "load",
        refreshIcons,
        {
            once:
                true
        }
    );

});