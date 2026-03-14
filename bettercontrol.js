/*
    Joystick For MCPE0.14.x
    Requires BlockLauncher to load.
    Created by maaamahAhh
    GitHub: https://github.com/maaamahAhh/Joystick-For-MCPE0.14.x
*/

var ctx = null;
var density = 1.0;
var isControlsInited = false;
var isTouchIntercept = false;
var isJoystickEnabled = true;

var BASE_RADIUS_DP = 80;
var KNOB_RADIUS_DP = 30;
var BASE_SPEED = 0.25;

var ORI_OFFSET_X = 5;
var ORI_OFFSET_Y = 30;

var ORI_BUTTON_SIZE = 60;
var ORI_SPRINT_OFFSET_X = 50;
var ORI_SPRINT_OFFSET_Y = 130;
var ORI_SNEAK_OFFSET_X = 130;
var ORI_SNEAK_OFFSET_Y = 80;

var ORI_DISABLE_BTN_SIZE = 50;
var ORI_DISABLE_OFFSET_X = 20;
var ORI_DISABLE_OFFSET_Y = 20;

var baseRadius = 0;
var knobRadius = 0;
var totalRadius = 0;
var DRAW_BASE_SIZE = 0;
var TOUCH_BASE = 0;
var TOUCH_FULL = 0;
var OFFSET_X = 0;
var OFFSET_Y = 0;
var BUTTON_SIZE = 0;
var SPRINT_OFFSET_X = 0;
var SPRINT_OFFSET_Y = 0;
var SNEAK_OFFSET_X = 0;
var SNEAK_OFFSET_Y = 0;
var DISABLE_BTN_SIZE = 0;
var DISABLE_OFFSET_X = 0;
var DISABLE_OFFSET_Y = 0;

var joyX = 0;
var joyY = 0;
var touching = false;

var drawBasePopup = null;
var drawBaseIv = null;
var drawBaseBmp = null;
var drawBaseCanvas = null;
var drawBasePaint = null;
var touchJoyPopup = null;
var touchJoyIv = null;
var touchJoyBmp = null;
var touchJoyCanvas = null;
var touchJoyPaint = null;

var sprintToggle = false;
var sneakToggle = false;
var sprintPopup = null;
var sneakPopup = null;

var disablePopup = null;
var disableIv = null;
var disableDrawable = null;

function initBaseParams() {
    try {
        ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();
        density = ctx.getResources().getDisplayMetrics().density;
        OFFSET_X = parseInt(ORI_OFFSET_X * density);
        OFFSET_Y = parseInt(ORI_OFFSET_Y * density);
        baseRadius = parseInt(BASE_RADIUS_DP * density);
        knobRadius = parseInt(KNOB_RADIUS_DP * density);
        totalRadius = baseRadius + knobRadius;
        DRAW_BASE_SIZE = baseRadius * 2;
        TOUCH_BASE = baseRadius * 2;
        TOUCH_FULL = totalRadius * 2;
        BUTTON_SIZE = parseInt(ORI_BUTTON_SIZE * density);
        SPRINT_OFFSET_X = parseInt(ORI_SPRINT_OFFSET_X * density);
        SPRINT_OFFSET_Y = parseInt(ORI_SPRINT_OFFSET_Y * density);
        SNEAK_OFFSET_X = parseInt(ORI_SNEAK_OFFSET_X * density);
        SNEAK_OFFSET_Y = parseInt(ORI_SNEAK_OFFSET_Y * density);
        DISABLE_BTN_SIZE = parseInt(ORI_DISABLE_BTN_SIZE * density);
        DISABLE_OFFSET_X = parseInt(ORI_DISABLE_OFFSET_X * density);
        DISABLE_OFFSET_Y = parseInt(ORI_DISABLE_OFFSET_Y * density);
    } catch (e) {}
}

function resizeTouchJoy(targetSize) {
    if (touchJoyPopup && ctx) {
        try {
            touchJoyPopup.update(OFFSET_X, OFFSET_Y, targetSize, targetSize);
        } catch (e) {}
    }
}

function initDrawBase() {
    if (drawBasePopup != null || !ctx) return;
    try {
        drawBaseBmp = android.graphics.Bitmap.createBitmap(DRAW_BASE_SIZE + knobRadius * 2, DRAW_BASE_SIZE, android.graphics.Bitmap.Config.ARGB_8888);
        drawBaseCanvas = new android.graphics.Canvas(drawBaseBmp);
        drawBasePaint = new android.graphics.Paint();
        drawBasePaint.setAntiAlias(true);

        drawBaseIv = new android.widget.ImageView(ctx);
        drawBaseIv.setImageBitmap(drawBaseBmp);
        drawBaseCanvas.drawColor(android.graphics.Color.TRANSPARENT, android.graphics.PorterDuff.Mode.CLEAR);
        drawBasePaint.setARGB(120, 0, 0, 0);
        drawBaseCanvas.drawCircle(baseRadius, baseRadius, baseRadius, drawBasePaint);
        drawBaseIv.invalidate();

        drawBasePopup = new android.widget.PopupWindow(drawBaseIv, DRAW_BASE_SIZE + knobRadius * 2, DRAW_BASE_SIZE, false);
        drawBasePopup.setFocusable(false);
        drawBasePopup.setTouchable(false);
        drawBasePopup.showAtLocation(ctx.getWindow().getDecorView(), android.view.Gravity.LEFT | android.view.Gravity.BOTTOM, OFFSET_X, OFFSET_Y);
    } catch (e) {}
}

function initTouchJoy() {
    if (touchJoyPopup != null || !ctx) return;
    try {
        touchJoyBmp = android.graphics.Bitmap.createBitmap(TOUCH_FULL, TOUCH_FULL, android.graphics.Bitmap.Config.ARGB_8888);
        touchJoyCanvas = new android.graphics.Canvas(touchJoyBmp);
        touchJoyPaint = new android.graphics.Paint();
        touchJoyPaint.setAntiAlias(true);

        touchJoyIv = new android.widget.ImageView(ctx);
        touchJoyIv.setImageBitmap(touchJoyBmp);
        drawJoyKnob();
        touchJoyIv.invalidate();

        touchJoyIv.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function(v, e) {
                if(!isJoystickEnabled || !e || !ctx || !v) return false;
                var action = e.getAction();
                var x = e.getX() - totalRadius + knobRadius;
                var y = e.getY() - totalRadius;
                var touchLen = Math.sqrt(x*x + y*y);

                if (action == android.view.MotionEvent.ACTION_DOWN) {
                    isTouchIntercept = (touchLen <= baseRadius);
                    if (!isTouchIntercept) return false;
                    resizeTouchJoy(TOUCH_FULL);
                }
                if (!isTouchIntercept) return false;

                if (action == android.view.MotionEvent.ACTION_DOWN || action == android.view.MotionEvent.ACTION_MOVE) {
                    touching = true;
                    joyX = x;
                    joyY = y;
                    var len = Math.sqrt(joyX*joyX + joyY*joyY);
                    if (len > baseRadius && len > 0) {
                        joyX = joyX / len * baseRadius;
                        joyY = joyY / len * baseRadius;
                    }
                    drawJoyKnob();
                    return true;
                }

                if (action == android.view.MotionEvent.ACTION_UP || action == android.view.MotionEvent.ACTION_CANCEL) {
                    touching = false;
                    joyX = 0;
                    joyY = 0;
                    isTouchIntercept = false;
                    drawJoyKnob();
                    resizeTouchJoy(TOUCH_BASE);
                    return true;
                }
                return false;
            }
        }));

        touchJoyPopup = new android.widget.PopupWindow(touchJoyIv, TOUCH_BASE, TOUCH_BASE, false);
        touchJoyPopup.setFocusable(false);
        touchJoyPopup.showAtLocation(ctx.getWindow().getDecorView(), android.view.Gravity.LEFT | android.view.Gravity.BOTTOM, OFFSET_X, OFFSET_Y);
    } catch (e) {}
}

function drawJoyKnob() {
    if (!touchJoyCanvas || !touchJoyPaint) return;
    try {
        touchJoyCanvas.drawColor(android.graphics.Color.TRANSPARENT, android.graphics.PorterDuff.Mode.CLEAR);
        touchJoyPaint.setARGB(180, 200, 200, 200);
        touchJoyCanvas.drawCircle(totalRadius + joyX, totalRadius + joyY, knobRadius, touchJoyPaint);
        if(touchJoyIv) touchJoyIv.invalidate();
    } catch (e) {}
}

function createJoystickDelayed() {
    new java.lang.Thread(new java.lang.Runnable({
        run: function () {
            try { java.lang.Thread.sleep(600); } catch (e) {}
            if(ctx) {
                ctx.runOnUiThread(new java.lang.Runnable({
                    run: function () {
                        initDrawBase();
                        initTouchJoy();
                    }
                }));
            }
        }
    })).start();
}

function createCircleBtn(color) {
    if(!ctx) return null;
    try {
        var iv = new android.widget.ImageView(ctx);
        var drawable = new android.graphics.drawable.GradientDrawable();
        drawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
        drawable.setColor(color);
        iv.setBackground(drawable);
        iv.setLayoutParams(new android.view.ViewGroup.LayoutParams(BUTTON_SIZE, BUTTON_SIZE));
        return {iv:iv, draw:drawable};
    } catch (e) {
        return null;
    }
}

function createDisableBtn() {
    if(disablePopup != null){
        try{disablePopup.dismiss();}catch(e){}
        disablePopup = null;
    }
    if(disablePopup != null || !ctx) return;
    try {
        var color = isJoystickEnabled ? android.graphics.Color.argb(180,100,255,100) : android.graphics.Color.argb(180,255,100,100);
        var btn = createCircleBtn(color);
        if(!btn) return;
        disableIv = btn.iv;
        disableDrawable = btn.draw;

        disableIv.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function(v,e){
                if(!e || e.getAction() != android.view.MotionEvent.ACTION_DOWN) return false;
                try {
                    isJoystickEnabled = !isJoystickEnabled;
                    disableDrawable.setColor(isJoystickEnabled ? android.graphics.Color.argb(180,100,255,100) : android.graphics.Color.argb(180,255,100,100));
                    if(!isJoystickEnabled) {
                        if(drawBasePopup) {drawBasePopup.dismiss(); drawBasePopup=null;}
                        if(touchJoyPopup) {touchJoyPopup.dismiss(); touchJoyPopup=null;}
                        if(sprintPopup) {sprintPopup.dismiss(); sprintPopup=null;}
                        if(sneakPopup) {sneakPopup.dismiss(); sneakPopup=null;}
                    } else {
                        initDrawBase();
                        initTouchJoy();
                        createSprintSneakBtn();
                    }
                } catch (e) {}
                return true;
            }
        }));

        disablePopup = new android.widget.PopupWindow(disableIv, DISABLE_BTN_SIZE, DISABLE_BTN_SIZE, false);
        disablePopup.setFocusable(false);
        disablePopup.showAtLocation(ctx.getWindow().getDecorView(), android.view.Gravity.RIGHT | android.view.Gravity.TOP, DISABLE_OFFSET_X, DISABLE_OFFSET_Y);
    } catch (e) {}
}

function createSprintSneakBtn() {
    if(!ctx || sprintPopup != null) return;
    var sprintBtn = createCircleBtn(android.graphics.Color.argb(180,255,100,100));
    if(sprintBtn) {
        sprintBtn.iv.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function(v,e){
                if(!isJoystickEnabled || !e || e.getAction() != android.view.MotionEvent.ACTION_DOWN) return false;
                sprintToggle = !sprintToggle;
                sprintBtn.draw.setColor(sprintToggle ? android.graphics.Color.argb(180,100,255,100) : android.graphics.Color.argb(180,255,100,100));
                return true;
            }
        }));
        sprintPopup = new android.widget.PopupWindow(sprintBtn.iv, BUTTON_SIZE, BUTTON_SIZE, false);
        sprintPopup.showAtLocation(ctx.getWindow().getDecorView(), android.view.Gravity.RIGHT | android.view.Gravity.BOTTOM, SPRINT_OFFSET_X, SPRINT_OFFSET_Y);
    }
    var sneakBtn = createCircleBtn(android.graphics.Color.argb(180,100,100,255));
    if(sneakBtn) {
        sneakBtn.iv.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function(v,e){
                if(!isJoystickEnabled || !e || e.getAction() != android.view.MotionEvent.ACTION_DOWN) return false;
                sneakToggle = !sneakToggle;
                sneakBtn.draw.setColor(sneakToggle ? android.graphics.Color.argb(180,100,255,255) : android.graphics.Color.argb(180,100,100,255));
                return true;
            }
        }));
        sneakPopup = new android.widget.PopupWindow(sneakBtn.iv, BUTTON_SIZE, BUTTON_SIZE, false);
        sneakPopup.showAtLocation(ctx.getWindow().getDecorView(), android.view.Gravity.RIGHT | android.view.Gravity.BOTTOM, SNEAK_OFFSET_X, SNEAK_OFFSET_Y);
    }
}

function modTick() {
    var p = Player.getEntity();
    if(!p) return;
    if(!isControlsInited) {
        initBaseParams();
        if(ctx) {
            createJoystickDelayed();
            ctx.runOnUiThread(new java.lang.Runnable({
                run: function () {
                    createSprintSneakBtn();
                    createDisableBtn();
                }
            }));
        }
        isControlsInited = true;
        return;
    }
    if(touching && isJoystickEnabled && ctx) {
        try {
            var yaw = Entity.getYaw(p)/180*Math.PI;
            var dx = joyX / baseRadius;
            var dy = joyY / baseRadius;
            if(Math.abs(dx)>=0.05 || Math.abs(dy)>=0.05){
                var speed = sprintToggle ? BASE_SPEED*1.3 : BASE_SPEED;
                var vx = (-Math.sin(yaw)*(-dy)+Math.cos(yaw)*(-dx))*speed;
                var vz = ( Math.cos(yaw)*(-dy)+Math.sin(yaw)*(-dx))*speed;
                Entity.setVelX(p, vx);
                Entity.setVelZ(p, vz);
            }
        } catch (e) {}
    }
    if(isJoystickEnabled) {
        Entity.setSneaking(p, sneakToggle);
    } else {
        Entity.setSneaking(p, false);
    }
}

function newLevel(){}

function leaveGame(){
    if(!ctx) return;
    ctx.runOnUiThread(new java.lang.Runnable({run:function(){
        try{
            if(drawBasePopup!=null){drawBasePopup.dismiss();drawBasePopup=null;}
            if(touchJoyPopup!=null){touchJoyPopup.dismiss();touchJoyPopup=null;}
            if(sprintPopup!=null){sprintPopup.dismiss();sprintPopup=null;}
            if(sneakPopup!=null){sneakPopup.dismiss();sneakPopup=null;}
            if(disablePopup!=null){disablePopup.dismiss();disablePopup=null;}
        }catch(e){}
    }}));
    isControlsInited = false;
    isTouchIntercept = false;
    touching = false;
    sprintToggle = false;
    sneakToggle = false;
    joyX = 0;
    joyY = 0;
    isJoystickEnabled = true;
    disableIv = null;
    disableDrawable = null;
    drawBaseBmp = null;drawBaseCanvas = null;drawBasePaint = null;drawBaseIv = null;
    touchJoyBmp = null;touchJoyCanvas = null;touchJoyPaint = null;touchJoyIv = null;
}