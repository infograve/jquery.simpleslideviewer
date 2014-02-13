/*
 *            ＿＿            simple slide viewer plugin v0.9.1
 *      ,::::::::｀:.､        https://github.com/infograve/jquery.simpleslideviewer
 *r─<7三]二[三]ミ､:::ヽ
 * ー´:j::.､::ヽ:{)〈＿〕    for jQuery
 *   {:/`ト .;:{｀/::ヽ_,,    http://jquery.com/
 *    ;{ ● ｀ ● ﾚ)::::く
 *     八"  v   " ｨ::':「     by Ko1.Imamura 2014
 *     ry≧ｧｖｧく>杉>::,ﾉ     Released under the MIT license
 *     }/ヽ}//{ {_/＼/L{      http://sourceforge.jp/projects/opensource/wiki/licenses/MIT_license
 *    <____ﾉ只＼ヾーく〃/
 *      `く二二二ｿ￣￣￣
 *         }_/ }_/
*/
;(function($){
  $.fn.ssViewer =function(argOptions){
    var svWindow =this;
    
    var defaultSetting ={
      distance: 0.2,
      onSwipeStart: function(){},
      onSwipeMove: function(){},
      onSwipeEnd: function(){}
    };
    var setting =$.extend(defaultSetting, argOptions);
    
    var winSize ={ width:$(svWindow).innerWidth(), height:$(svWindow).innerHeight() };
    var contentSize ={ width:$(svWindow).children().eq(0).innerWidth(), height:$(svWindow).children().eq(0).innerHeight() };
    var contentPage ={ x:Math.floor(contentSize.width/winSize.width), y:Math.floor(contentSize.height/winSize.height) };
    
    var tmpPosition =$(svWindow).position();
    var contentPosition ={ x:Math.floor(tmpPosition.left), y:Math.floor(tmpPosition.top) };

    var isSwipe =false;
    var currentPage ={ x:0, y:0 };
    var startPosition ={ x:0, y:0 };
    var flickDelta ={ x:0, y:0 };
    
    var fnSwipeStart =function(argEvent){
      isSwipe =true;
      if(argEvent.originalEvent.touches==null) startPosition ={ x:Math.floor(argEvent.pageX-contentPosition.x), y:Math.floor(argEvent.pageY-contentPosition.y) };
      else startPosition ={ x:Math.floor(argEvent.originalEvent.touches[0].pageX-contentPosition.x), y:Math.floor(argEvent.originalEvent.touches[0].pageY-contentPosition.y) };
      setting.onSwipeStart({ currentPageX:currentPage.x, currentPageY:currentPage.y, startX:startPosition.x, startY:startPosition.y });
      argEvent.preventDefault();
    };
    var fnSwipeMove =function(argEvent){
      if(isSwipe){
        var tmpPointer;
        if(argEvent.originalEvent.touches==null) tmpPointer ={ x:Math.floor(argEvent.pageX-contentPosition.x), y:Math.floor(argEvent.pageY-contentPosition.y) };
        else tmpPointer ={ x:Math.floor(argEvent.originalEvent.touches[0].pageX-contentPosition.x), y:Math.floor(argEvent.originalEvent.touches[0].pageY-contentPosition.y) };
        flickDelta ={ x:startPosition.x-tmpPointer.x, y:startPosition.y-tmpPointer.y };
        $(svWindow).scrollLeft(winSize.width *currentPage.x +flickDelta.x);
        $(svWindow).scrollTop(winSize.height *currentPage.y +flickDelta.y);
        setting.onSwipeMove({ currentPageX:currentPage.x, currentPageY:currentPage.y, startX:startPosition.x, startY:startPosition.y, deltaX:flickDelta.x, deltaY:flickDelta.y });
      }
      argEvent.preventDefault();
    };
    var fnSwipeEnd =function(argEvent){
      if(isSwipe){
        var tmpX =currentPage.x;
        tmpX +=flickDelta.x>(winSize.width *setting.distance) ? 1: 0;
        tmpX -=flickDelta.x<-(winSize.width *setting.distance) ? 1: 0;
        var tmpY =currentPage.y;
        tmpY +=flickDelta.y>(winSize.height *setting.distance) ? 1: 0;
        tmpY -=flickDelta.y<-(winSize.height *setting.distance) ? 1: 0;
        var tmpSwiped =fnPagefix(tmpX, tmpY);
        var tmpStartPosition =startPosition;
        var tmpDelta =flickDelta;
        startPosition ={x:0, y:0};
        flickDelta ={x:0, y:0};
        isSwipe =false;
        setting.onSwipeEnd({ currentPageX:currentPage.x, currentPageY:currentPage.y, startX:tmpStartPosition.x, startY:tmpStartPosition.y, deltaX:tmpDelta.x, deltaY:tmpDelta.y, swiped:tmpSwiped });
      }
      argEvent.preventDefault();
    };
    
    var fnForward =function(){
      fnPagefix(currentPage.x+1, currentPage.y);
    }
    var fnRewind =function(){
      fnPagefix(currentPage.x-1, currentPage.y);
    }
    var fnRise =function(){
      fnPagefix(currentPage.x, currentPage.y-1);
    }
    var fnDrop =function(){
      fnPagefix(currentPage.x, currentPage.y+1);
    }
    var fnPagefix =function(argTargetX,argTargetY){
      var tmpTargetX =argTargetX==null ? currentPage.x: argTargetX;
      tmpTargetX =tmpTargetX<0 ? 0: tmpTargetX;
      tmpTargetX =tmpTargetX<contentPage.x ? tmpTargetX: contentPage.x-1;
      var tmpTargetY =argTargetY==null ? currentPage.y: argTargetY;
      tmpTargetY =tmpTargetY<0 ? 0: tmpTargetY;
      tmpTargetY =tmpTargetY<contentPage.y ? tmpTargetY: contentPage.y-1;
      var tmpSwiped =tmpTargetX!=currentPage.x||tmpTargetY!=currentPage.y ? true: false;
      currentPage ={ x:tmpTargetX, y:tmpTargetY };
      $(svWindow).animate({ scrollTop:(winSize.height *tmpTargetY), scrollLeft:(winSize.width *tmpTargetX) }, 200);
      return tmpSwiped;
    }
    
    var fnContentPage =function(){
      return contentPage;
    }
    var fnCurrentPage =function(){
      return currentPage;
    }
    
    $(svWindow).on('mousedown', fnSwipeStart);
    $(svWindow).on('touchstart', fnSwipeStart);
    $(svWindow).on('mousemove', fnSwipeMove);
    $(svWindow).on('touchmove', fnSwipeMove);
    $(svWindow).on('mouseup', fnSwipeEnd);
    $(svWindow).on('touchend', fnSwipeEnd);
    $(svWindow).on('mouseout', fnSwipeEnd);
    
    return { forward:fnForward, rewind:fnRewind, rise:fnRise, drop:fnDrop, slideTo:fnPagefix, getCurrentPage:fnCurrentPage, getContentPage:fnContentPage };
  }
})(jQuery);
