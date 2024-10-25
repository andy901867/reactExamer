//素養多選題Component
Vue.component('compentence-multiple',{
  template:"#CMTemplate",
  data(){
    return {
      questionHTML:'',
    }
  },
  props:{
    question:Object,
    index: Number
  },
  created(){
    const regx = /_{3,}/g;

    let index = 0;
    var template = this.question.question.replace(regx,()=>{
      var str = `<span class="position-relative mx-1">
                      <select class="border border-secondary rounded pr-2" @change="selectAnswer(${index})" v-model="subQuestions[${index}].selected">
                          <option :value="option.optionid" v-for="option in subQuestions[${index}].options">{{option.optiontext}}</option>
                      </select>
                      <i class="fa fa-check-circle text-success bg-white fz16 position-absolute" style="top:50%;right:.5rem;transform:translateY(-50%)" v-if="subQuestions[${index}].isCorrect"></i>
                      <i class="fa fa-times-circle text-danger bg-white fz16 position-absolute" style="top:50%;right:.5rem;transform:translateY(-50%)" v-if="subQuestions[${index}].isCorrect === false"></i>
                </span>`;
      index++;      
      return str
    })

    var subQuestions = this.question.subQuestions;

    const dynamicComponent = Vue.extend({
      template: `<span>${template}</span>`,
      data(){
        return {
          subQuestions: subQuestions,
        }
      },
      created(){
        this.subQuestions.forEach(item=>{
          this.$set(item,'selected','')
        })
      },
      watch(){

      },
      methods:{
        selectAnswer(index){
          var selectedAnswer = event.currentTarget.value;                    

          eventBus.$emit('pass-answer',{index, selectedAnswer})

          //練習模式時檢查答案
          if(vm.mode === 'practicing'){
            var currentSubQuestion = this.subQuestions[index]
            var selectedOption = currentSubQuestion.options.find(option => option.optionid === selectedAnswer)
            this.$set(currentSubQuestion,'isCorrect', selectedOption.isAnswer)
          }
        }
      }
    })

    var eventBus = new Vue();
    

    this.$nextTick(()=>{
      new dynamicComponent().$mount(this.$refs.dynamicComponent);
    })
    

    // eventBus.$on('all-done',(data)=>{
    //   this.question.student_answer = data
    // })
    eventBus.$on('pass-answer',({index,selectedAnswer})=>{
      this.question.student_answer[index] = selectedAnswer
      this.question.student_answer.splice(index,1,selectedAnswer)  
    })
  },
  computed:{
    isCanReset(){
      var arr = [];
      this.question.student_answer.forEach(answer => {
        if(answer){
          arr.push(true)
        }
      })
      return arr.some(item => item === true)
    }
  },
  methods:{
    resetQuestion(){          
      if(this.isCanReset){
        this.question.subQuestions.forEach(item =>{
          item.selected = ''
        })
        this.question.student_answer = []
      }        
    },
  }
})
//END: 素養多選題Component

//素養配合題Component
Vue.component('compentence-match-item',{
  template:"#CMITemplate",
  data(){
    return {
      // questionHTML:'',
      draggingComponent:''
    }
  },
  props:{
    question:Object,
    index: Number
  },
  created(){
    const regx = /_{3,}/g;

    let index = 0;
    var questionTemplate = this.question.question.replace(regx,()=>{
      var str = `<span class="border-bottom d-inline-flex justify-content-center mx-1 mb-2" style="min-width:100px;" @mouseenter="handleDragEnter()" @mouseleave="handleDragLeave()" @handledrop="handleDrop(${index})" ref="dropZone${index}">
                    <span class="p-2 d-inline-block" ref="blank${index}" v-if="!blanks[${index}].option">
                      <p class="fz14 text-muted text-center mb-0">拖曳到此</p>
                    </span>
                    <div class="dragging-option d-inline-block mb-1" style="width:unset" @mousedown="startDrag(blanks[${index}].option, ${index})" @touchstart="startDrag(blanks[${index}].option, ${index})" v-if="blanks[${index}].option">{{blanks[${index}].option.optiontext}}</div>
                    <i class="fas fa-check-circle text-success fz14 ml-1" v-if="blanks[${index}].isCorrect"></i>
                    <i class="fas fa-times-circle text-danger fz14 ml-1" v-if="blanks[${index}].isCorrect === false"></i>
                </span>`
      index++;      
      return str
    })

    var optionsTemplate = `<div class="position-static d-flex flex-wrap mt-3" @handledrop="handleDrop()" ref="dropZone${index}">
                              <div class="dragging-option d-inline-block mr-2 mb-1" style="width:unset" :class="{'option-used': option.isUsed}" 
                                v-for="option in options" :key="option.optionid" 
                                @mousedown="handleStartDrag(option)" @touchstart.prevent="handleStartDrag(option)">{{option.optiontext}}</div>
                          </div>`;

    var options = this.question.options;
    var blanks = options.map(item=>{return {option:''}})
    var blanks = [...Array(index)].map(blank => {return {option:''}})

    const dynamicComponent = Vue.extend({
      template: `<div class="position-relative p-3" ref="parent">
                    <span>${questionTemplate}</span>
                    ${optionsTemplate}
                </div>`,
      data(){
        return {
          options: options,
          blanks: blanks,

          isDragging: false,
          draggingData:'',
          dragFrom:'',
        }
      },
      methods:{
        handleStartDrag(data){
          if(data.isUsed){
            return false;
          }
          this.startDrag(data)
        },
        startDrag(data, dragFrom){
          event.preventDefault()
          this.isDragging = true;
          this.draggingData = data;
          this.dragFrom = typeof dragFrom === 'number' ? dragFrom : data;

          const parent = document.getElementById('app');
          const originEl = event.currentTarget;
          // const parentRect = parent.getBoundingClientRect();
          const target = originEl.cloneNode(true);
        
          target.style.position = 'absolute';
          target.style.zIndex = '100';
          target.style.transform = 'translate(-50%,-50%)';
          target.style.pointerEvents = 'none';
          target.style.touchAction = 'none';
          target.style.whiteSpace = 'nowrap';

          parent.appendChild(target);
          originEl.style.opacity = 0.5;

          const eventType = event.type;

          const moveAt = (x,y) => {
            const parentRect = parent.getBoundingClientRect();
            target.style.left = x - parentRect.left + 'px';
            target.style.top = y - parentRect.top + 'px';
          };
          
          let keepScrollingUp = null;
          const handleMoveAt = (event)=>{
            event.preventDefault(); 
             var { clientX, clientY } = event.type === 'touchmove' ? event.touches[0] : event;             
             if(clientY<50){
                if(keepScrollingUp === null){
                  keepScrollingUp = setInterval(()=>{
                    var originY = window.pageYOffset
                    window.scrollTo(0,originY-10)   
                    moveAt(clientX,clientY-10)               
                  },20) 
                }                                             
             }
             else if(clientY>window.innerHeight-50){
                if(keepScrollingUp === null){
                  keepScrollingUp = setInterval(()=>{
                    var originY = window.pageYOffset
                    window.scrollTo(0,originY+10)   
                    moveAt(clientX,clientY+10)               
                  },20) 
                }
             }
             else{
              window.clearInterval(keepScrollingUp)
              keepScrollingUp = null;
              moveAt(clientX,clientY)
             }
          }

          const handleEndDragging = (event)=>{
            window.clearInterval(keepScrollingUp)
            keepScrollingUp = null;
            target.remove();
            originEl.style.opacity = 1;
            
            if(event.type === 'touchend'){
              parent.removeEventListener('touchmove',handleMoveAt)
              parent.removeEventListener('touchend',handleEndDragging)

              var {clientX, clientY} = event.changedTouches[0]                           
            }
            else{
              parent.removeEventListener('mousemove',handleMoveAt)
              parent.removeEventListener('mouseup',handleEndDragging)

              var {clientX, clientY} = event
            }

            var dropEls = document.elementsFromPoint(clientX,clientY)

            // 觸發自訂事件
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("handledrop", false, false);

            dropEls.forEach(el =>{
              el.dispatchEvent(evt)
            })
            this.isDragging = false; 
          }

          if(eventType === 'touchstart'){
            moveAt(event.touches[0].clientX, event.touches[0].clientY)
            parent.addEventListener('touchmove', handleMoveAt)
            parent.addEventListener('touchend',handleEndDragging)           
          }
          else{
            moveAt(event.clientX, event.clientY)
            parent.addEventListener('mousemove',handleMoveAt)
            parent.addEventListener('mouseup',handleEndDragging)
          }
        } ,      
        handleDragEnter(){
          if(this.isDragging){
            event.currentTarget.classList.add('dropzone-ondragging')
          }
        },
        handleDragLeave(){
          event.currentTarget.classList.remove('dropzone-ondragging')
        },
        handleDrop(droppedIndex) {
          if (!this.isDragging) {
            return;
          }
        
          const { blanks, dragFrom, draggingData } = this;
          const isFromBlank = typeof dragFrom === 'number';
        
          if (droppedIndex === undefined) {
            // 拖曳到下方選項
            if (isFromBlank) {
              blanks[dragFrom].option.isUsed = false;
              blanks[dragFrom].option = '';
            }
          }
          else{
            if (isFromBlank) {
              // 拖曳來自空格
              blanks[dragFrom].option = blanks[droppedIndex].option;
            } else {
              // 拖曳來自下方選項
              if (blanks[droppedIndex].option) {
                blanks[droppedIndex].option.isUsed = false;
              }
              this.$set(dragFrom, 'isUsed', true);
            }        
            blanks[droppedIndex].option = draggingData;
          }                  

          //回傳學生作答
          studentAnswer = blanks.map(blank => blank.option.optionid);
          eventBus.$emit('pass-answer',{studentAnswer})

          //取消答案檢查
          if(vm.mode ==='practicing'){
            this.blanks.forEach(blank => {
              this.$set(blank,'isCorrect', undefined);
            })
          }
        }
      }
    })

    var eventBus = new Vue();
    

    this.$nextTick(()=>{
      this.draggingComponent = new dynamicComponent();
      this.draggingComponent.$mount(this.$refs.dynamicComponent);
    })
    
    eventBus.$on('pass-answer',({studentAnswer})=>{
      this.question.student_answer = studentAnswer 
    })
  },
  computed:{
    isCanReset(){
      var arr = [];
      this.question.student_answer.forEach(answer => {
        if(answer){
          arr.push(true)
        }
      })
      return arr.some(item => item === true)
    }
  },
  methods:{
    resetQuestion(){         
      if(this.isCanReset){
        this.draggingComponent.options.forEach(option => option.isUsed = false)
        this.draggingComponent.blanks = this.draggingComponent.blanks.map(blank =>{return {option:''}})
        this.question.student_answer = []
      }        
    },
    checkAnswer(){
      this.draggingComponent.blanks.forEach((blank,index) => {
        if(blank.option.optionid === this.question.answer[index]){
          this.$set(blank,'isCorrect', true);
        }
        else{
          this.$set(blank,'isCorrect', false);
        }        
      })
    }
  }
})

var vm=new Vue({
  el:"#app",
  data:{
    //測驗狀態
    ontest:true,
      //mode 分為 testing / practicing / DEPL
    mode: "practicing",
    //考生
    member:{
      memberid:"XXXX",
      name: "Andy",
      use_time:10000,
    },
    //試卷
    exam:{
      exam_name: "20191112 物理科第二次期中考",
      qualified_score: 60,
      max_score:70,
      limit_time: 20,
      show_answer: "2018/11/31",
    },
    //題目 註: 後端傳進來的資料必須按照 是非、單選、多選、配合、排序、填充 之順序
    questions:[
      {
        question:"JUU5JTgwJTk5JUU2JTk4JUFGJUU0JUI4JTgwJUU5JTgxJTkzJUU2JTk4JUFGJUU5JTlEJTlFJUU5JUExJThD",
        id:"fsf",
        type:"tf",
        options: [{optionid:"xxxx-XXXX",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy"},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy"}],
        answer:"xxxx-XXXX",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:0,

        student_answer:"",
        isRemarked: false,
      },
      {
        question:"JUU5JTgwJTk5JUU2JTk4JUFGJUU0JUI4JTgwJUU5JTgxJTkzJUU1JTk2JUFFJUU5JTgxJUI4JUU5JUExJThD",
        id:"vbre",
        type:"s",
        options:[{optionid:"xxxx-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-feeffee",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},],
        answer:"xxxx-xxxx",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:1,

        student_answer:"",
        isRemarked: false,
      },
      {
        question:"JUU5JTgwJTk5JUU2JTk4JUFGJUU0JUI4JTgwJUU5JTgxJTkzJUU1JTk2JUFFJUU5JTgxJUI4JUU5JUExJThD",
        id:"dsf",
        type:"s",
        options:[{optionid:"xxxx-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-feeffee",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},],
        answer:"xxxx-xxxx",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:2,

        student_answer:"",
        isRemarked: false,
      },
      {
        question:"JUU5JTgwJTk5JUU2JTk4JUFGJUU0JUI4JTgwJUU5JTgxJTkzJUU1JTk2JUFFJUU5JTgxJUI4JUU5JUExJThD",
        id:"dfefessf",
        type:"s",
        options:[{optionid:"xxxx-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-feeffee",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},],
        answer:"xxxx-xxxx",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:3,

        student_answer:"",
        isRemarked: false,
      },
      {
        question:"JUU5JTgwJTk5JUU2JTk4JUFGJUU0JUI4JTgwJUU5JTgxJTkzJUU1JTk2JUFFJUU5JTgxJUI4JUU5JUExJThD",
        id:"vbfdfre",
        type:"s",
        options:[{optionid:"xxxx-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-feeffee",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},],
        answer:"xxxx-xxxx",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:4,

        student_answer:"",
        isRemarked: false,
      },
      {
        question:"JUU5JTgwJTk5JUU2JTk4JUFGJUU0JUI4JTgwJUU5JTgxJTkzJUU1JTk2JUFFJUU5JTgxJUI4JUU5JUExJThD",
        id:"vbfdfdre",
        type:"s",
        options:[{optionid:"xxxx-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xsf-feeffee",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},],
        answer:"xxxx-xxxx",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:5,

        student_answer:"",
        isRemarked: false,
      },
      {
        question:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        id:"yjyt",
        type:"m",
        options:[{optionid:"XXXX-xxxx",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"yyyy-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true},{optionid:"xffef-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",optionon:true}],
        answer:["XXXX-xxxx","yyyy-yyyy"],
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:6,

        student_answer:[],
        isRemarked: false,
      },
      {
        question:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        id:"gsgv",
        type:"mi",
        options:[{optionid:"xxxx-xxxx",optiontext:"JUU5JTg1JThEJUU1JTkwJTg4JUU5JTgxJUI4JUU5JUEwJTg1MQ==",height:'initial'},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",height:'initial'},{optionid:"xxfxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",height:'initial'}],//固定欄位
        ordering_options:[{optionid:"a",optiontext:"JUU2JThCJTk2JUU2JTlCJUIzJUU0JUJCJUE1JUU5JTgxJUI4JUU1JThGJTk2MQ==",height:'initial'},{optionid:"b",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",height:'initial'},{optionid:"c",optiontext:"JUU2JThCJTk2JUU2JTlCJUIzJUU0JUJCJUE1JUU5JTgxJUI4JUU1JThGJTk2",height:'initial'}],//考生排序
        answer:["a","c","b"],
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:7,

        student_answer:[],
        isRemarked: false,
      },
      {
        question:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        id:"gsgqqv",
        type:"mi",
        options:[{optionid:"xxxx-xxxx",optiontext:"JUU5JTg1JThEJUU1JTkwJTg4JUU5JTgxJUI4JUU5JUEwJTg1MQ==",height:'initial'},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",height:'initial'},{optionid:"xxfxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",height:'initial'}],//固定欄位
        ordering_options:[{optionid:"a",optiontext:"JUU2JThCJTk2JUU2JTlCJUIzJUU0JUJCJUE1JUU5JTgxJUI4JUU1JThGJTk2MQ==",height:'initial'},{optionid:"b",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",height:'initial'},{optionid:"c",optiontext:"JUU2JThCJTk2JUU2JTlCJUIzJUU0JUJCJUE1JUU5JTgxJUI4JUU1JThGJTk2",height:'initial'}],//考生排序
        answer:["a","c","b"],
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:8,

        student_answer:[],
        isRemarked: false,
      },
      {
        question:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        id:"rfd",
        type:"sr",
        options:[{optionid:"xxxx-xxxx",optiontext:"JUU5JTg1JThEJUU1JTkwJTg4JUU5JTgxJUI4JUU5JUEwJTg1MQ==",height:'initial'},{optionid:"xxxx-yyyy",optiontext:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",height:'initial'}],
        answer:["xxxx-xxxx","xxxx-yyyy"],
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:9,

        student_answer:[],
        isRemarked: false,
      },
      {
        question:"JUU4JThCJUE1JUU4JTkzJTg0JUU5JTlCJUJCJUU2JUIxJUEwJUU3JTlBJTg0JUU1JTg1JTg1JUU5JTlCJUJCJUU5JTlCJUJCJUU2JUI1JTgxJUU3JTgyJUJBX19fJUU3JTgyJUJBX19fX19fX19fJUU0JUJEJTk1JUVGJUJDJTlGJTNDMTAzJUU3JUI1JUIxJUU2JUI4JUFDJTNFJTIw",
        id:"vfgy",
        type:"fb",
        answer:["JUU3JUFEJTk0JUU2JUExJTg4","JUU3JUFEJTk0JUU2JUExJTg4"],
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:10,

        student_answer:[],
        isRemarked: false,
      },
      {
        question:"這是一道素養題____這是一道素養題_____這是一道素養題_____",
        subQuestions:[
          {
            options:[{optionid:"1xxxx-xxxx",optiontext:"選項A",isAnswer:false},{optionid:"1xxxx-yyyy",optiontext:"選項B",isAnswer:true},{optionid:"1xxxxzzzz",optiontext:"選項C",isAnswer:false}],
          },
          {
            options:[{optionid:"2xxxx-xxxx",optiontext:"選項X",isAnswer:false},{optionid:"2xxxx-yyyy",optiontext:"選項Y",isAnswer:false},{optionid:"2xxxxzzzz",optiontext:"選項Z",isAnswer:true}],
          },
          {
            options:[{optionid:"3xxxx-xxxx",optiontext:"選項1",isAnswer:false},{optionid:"3xxxx-yyyy",optiontext:"選項2",isAnswer:false},{optionid:"3xxxxzzzz",optiontext:"選項3",isAnswer:true}],
          }
        ],
        id:"jfklsdjflk",
        type:"cm",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:10,

        student_answer:[],
        isRemarked: false,
      },
      {
        question:"素養題XXXX素養題____素養題XXXX素養題_____素養題XXXX素養題_____",
        subQuestions:[
          {
            options:[{optionid:"1xxxx-xxxx",optiontext:"選項A",isAnswer:false},{optionid:"1xxxx-yyyy",optiontext:"選項B",isAnswer:true},{optionid:"1xxxxzzzz",optiontext:"選項C",isAnswer:false}],
          },
          {
            options:[{optionid:"2xxxx-xxxx",optiontext:"選項X",isAnswer:false},{optionid:"2xxxx-yyyy",optiontext:"選項Y",isAnswer:false},{optionid:"2xxxxzzzz",optiontext:"選項Z",isAnswer:true}],
          },
          {
            options:[{optionid:"3xxxx-xxxx",optiontext:"選項1",isAnswer:false},{optionid:"3xxxx-yyyy",optiontext:"選項2",isAnswer:false},{optionid:"3xxxxzzzz",optiontext:"選項3",isAnswer:true}],
          }
        ],
        id:"jfklsdjflk",
        type:"cm",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:10,

        student_answer:[],
        isRemarked: false,
      },
      {
        question:"這是需要拖曳配合的素養題____這是需要拖曳配合的素養題_____這是需要拖曳配合的素養題_____這是需要拖曳配合的素養題_____",
        options:[{optionid:"3xxxx-xxxx",optiontext:"選項1"},{optionid:"3xxxx-4444",optiontext:"選項2"},{optionid:"3xxxx-5858",optiontext:"選項3"},{optionid:"3xxxx-58585",optiontext:"選項4"}],
        id:"epkddfpkes",
        type:"cmi",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:10,
        answer:['3xxxx-58585','3xxxx-5858','3xxxx-4444','3xxxx-xxxx'],
        student_answer:[],
        isRemarked: false,
      },
      {
        question:"這是需要拖曳配合的素養題____這是需要拖曳配合的素養題_____這是需要拖曳配合的素養題_____這是需要拖曳配合的素養題_____",
        options:[{optionid:"3xxxx-xxxx",optiontext:"選項1"},{optionid:"3xxxx-4444",optiontext:"選項2"},{optionid:"3xxxx-5858",optiontext:"選項3"},{optionid:"3xxxx-58585",optiontext:"選項4"},{optionid:"3xxkokvc8585",optiontext:"選項5"}],
        id:"epkfpkes",
        type:"cmi",
        exp:"QkFTRTY0JUU1JUFEJTk3JUU0JUI4JUIy",
        gorder:10,
        answer:['3xxxx-58585','3xxxx-5858','3xxxx-4444','3xxxx-xxxx'],
        student_answer:[],
        isRemarked: false,
      },
    ],
    time_remaining:0,
    //經過filter後的題目資料
    tf:[],
    s:[],
    m:[],
    mi:[],
    sr:[],
    fb:[],
    cm:[], //素養多選
    cmi:[], //素養配合
    //經過filter後包含的題目類型
    question_types:[],
    question_types_name:{tf:"是非題", s:"單選題", m:"多選題", mi:"配合題", sr:"排序題", fb:"填充題",cm:"素養多選題",cmi:"素養配合題"},
    //字體大小控制
      // font_sizes:["大","中","小"],
    font_size:{
      value:"mid",
      types:[
        {name:"小",value:"sm"},{name:"中",value:"mid"},{name:"大",value:"big"}
      ],
      question_size:'fz20',
      option_size:'fz16',
    },
    // 拖曳選項
    whichdrag:0,
    dragdata:{},
    //螢幕大小
    screen_width:0,

    isOpenQnav:true,

    //錯誤回報
    feedback:{

    },
    //中止計時
    stop_timer: false,

    // for DELP
    proficiency:{
      test_name:"基本電學",
      student:{
        value:75,
        chapters:[
          {
            name:"第一章 電的基本概念",
            value:60,
            sections:[
              {name:"1-1節",value:70},
              {name:"1-2節",value:60},
              {name:"1-3節",value:85},
            ],
          },
          {
            name:"第二章 電 阻",
            value:60,
            sections:[
              {name:"2-1節",value:80},
              {name:"2-2節",value:90},
            ],
          },
          {
            name:"第三章 串並聯電路",
            value:90,
            sections:[
              {name:"3-1節",value:30},
            ],
          },
          {
            name:"第四章 直流迴路",
            value:78,
            sections:[
              {name:"4-1節",value:80},
            ],
          },
          {
            name:"第五章 XXXXXX",
            value: 30,
            sections:[
              {name:"1-1節",value:10},
            ],
          },
          {
            name:"第六章 YYYYY",
            value:70,
            sections:[
              {name:"1-1節",value:10},
            ],
          },
        ],
      },
    },
    mycollapse:[],
    target:{
      main:'student',
      target:{
        school:{
          name:"勁園國際學院",
          id:'XXXX',
        },
        department:{
          name:"冷凍科",
          id:'XXXX',
        },
        class:{
          name:"A班",
          id:'XXXX',
        },
        student:{
          name:"李權祐",
          id:'XXXXX',
          img:'asset/images/fake-user-photo.jpg',
        },
      },
    },
  },
  mounted:function(){
    this.filterQuestionType();
    this.screenWidth();
    this.countDown();
  },
  updated:function(){
    this.mi.forEach((question)=>{
      this.equalHeight(question);
    });
    this.sr.forEach((question)=>{
      this.orderHeight(question);
    })
  },
  watch:{
    screen_width:function(){
      this.mi.forEach((question)=>{
          this.equalHeight(question);
      })
    }
  },
  computed:{
    //考生答題數
    user_answered:function(){
      var answered=0;
      this.questions.forEach((question)=>{
        if(question.student_answer!=''){
          answered+=1;
        }
      })
      return answered;
    },
    //答題進度條寬度
    process_width: function(){
      return (this.user_answered/this.questions.length)*100 +'%';
    },
    //考後公布答案與否
    show_answer:function(){
      var today=new Date();
      var answer_day=new Date(this.exam.show_answer);
      var show_after_test= answer_day<today;
      if(show_after_test==true && this.ontest==false){
        return true;
      }else{
        return false;
      }
    },
    show_count_down:function(){
      return this.timeFormat(this.time_remaining);
    },
    show_use_time:function(){
      return this.timeFormat(this.member.use_time);
    }
  },
  methods:{
    timeFormat:function(millisecond){
      var hours=parseInt(millisecond  / (1000 * 60 * 60));
      var minutes = parseInt((millisecond % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = (millisecond % (1000 * 60)) / 1000;
      if(hours<10){
        hours="0" + hours.toString();
      }
      if(minutes<10){
        minutes="0" + minutes.toString();
      }
      if(seconds<10){
        seconds="0" + seconds.toString();
      }
      return hours + ':' + minutes + ':' + seconds;
    },
    filterQuestionType:function(){
      this.questions.forEach((question)=>{
        let type=question.type;
        if(this.question_types.indexOf(type)<0){
          this.question_types.push(type);
        }
        switch(type){
          case "tf":this.tf.push(question);
          break;
          case "s":this.s.push(question);
          break;
          case "m":this.m.push(question);
          break;
          case "mi":this.mi.push(question);
          break;
          case "sr":this.sr.push(question);
          break;
          case "fb":this.fb.push(question);
          break;
          case "cm":this.cm.push(question);
          break;
          case "cmi":this.cmi.push(question);
          break;
        };
      });
    },
    //滾動至每一題
    scrollToQuestion:function(id){
      var header_height= this.$refs.header.clientHeight;
      var screen_height= window.innerHeight;
      var card_height= this.$refs[id][0].clientHeight;
      var additional_distance= (screen_height - header_height - card_height)/2;
      if(additional_distance<0){
        additional_distance=15;
      }
      var distance=this.$refs[id][0].getBoundingClientRect().top+window.pageYOffset-header_height/2-additional_distance;
      return distance;
    },
    scrollToCertainQuestion:function(id){
      var distance=this.scrollToQuestion(id);
      this.scrollTo(distance,200,0);
    },
    scrollTo:function(to, duration,delay){
      setTimeout(()=>{
        Math.easeInOutQuad = function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t + b;
            t--;
            return -c/2 * (t*(t-2) - 1) + b;
        };
        const element = document.scrollingElement;
        const start = (element && element.scrollTop) || window.pageYOffset,
            change = to - start,
            increment = 20;
        let currentTime = 0;

        const animateScroll = function(){
            currentTime += increment;
            const val = Math.easeInOutQuad(currentTime, start, change, duration);
            window.scroll(0, val);
            if(currentTime < duration) {
                window.setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
      },delay)
    },
    scrollToNext:function(question){
      var current_order=this.questions.indexOf(question);
      var next_order=current_order+1;
      //尋找下一個未作答者
      for(i=next_order;i<this.questions.length;i++){
        var ans=this.questions[i].student_answer;
        if(ans==''){
          next_order=i;
          break;
        }
      }
      var next_id=this.questions[next_order].id;

      var distance=this.scrollToQuestion(next_id);
      this.scrollTo(distance,400,200);
    },
    scrollToNextNav:function(question){
      if(this.screen_width<=768){
        var current_order=this.questions.indexOf(question);
        var next_order=current_order+1;
        //尋找下一個未作答者
        for(i=next_order;i<this.questions.length;i++){
          var ans=this.questions[i].student_answer;
          if(ans==''){
            next_order=i;
            break;
          }
        }
        var next_id=this.questions[next_order].id;

        var nav_ref='nav' + next_id;
        //overflowx可視區域的寬度
        var scrollXWidth=this.$refs.overflowx.clientWidth;
        //目標元素離滾動內容最左邊的距離
        var nextElement=this.$refs[nav_ref][0];
        var mostLeft=nextElement.offsetLeft+nextElement.parentNode.offsetLeft+nextElement.parentNode.parentNode.offsetLeft;
        //滾動X軸
        // this.$refs.overflowx.scrollLeft=mostLeft-(scrollXWidth/2);
        //線性滾動 執行時間200ms
        var start_position=this.$refs.overflowx.scrollLeft;
        var current_position=start_position;
        var target_position=mostLeft-(scrollXWidth/2);
        var difference=target_position-start_position;
        var transition_time=600;
        var increment=20;
        var runtimes=transition_time/increment;
        var move=difference/runtimes;
        var startScroll= setInterval(()=>{
          this.$refs.overflowx.scrollLeft=current_position + move;
          current_position+=move;
          if(move>0 && current_position>=target_position){
            clearInterval(startScroll);
          }else if(move<0 && current_position<=target_position){
            clearInterval(startScroll);
          }
        },increment)
      }
    },
    changeFontSize:function(){
      var fz=this.font_size;
      switch(fz.value){
        case 'sm': fz.question_size='fz18'; fz.option_size='fz14';
        break;
        case 'mid': fz.question_size='fz20'; fz.option_size='fz16';
        break;
        case 'big': fz.question_size='fz24'; fz.option_size='fz20';
        break;
      }
    },
    resetQuestion:function(question){
      var type=question.type;
      switch(type){
        case "tf": if(question.student_answer != ''){question.student_answer="";};
        break;
        case "s": if(question.student_answer != ''){question.student_answer="";};
        break;
        case "m": if(question.student_answer != undefined){question.student_answer=[];};
        break;
        case "fb": question.student_answer=[];
        break;
      }
    },
    resetPracticeFb:function(question){
      if(question.practice_verified){
        question.practice_verified=false;
      }
    },
    //mi sr 以拖曳效果作答
    dragend:function(question){
      var type=question.type;
      if(type=='mi'){
        question.student_answer=question.ordering_options.map((item)=>{
          return item.optionid;
        });
      }else if(type =='sr'){
        question.student_answer=question.options.map((item)=>{
          return item.optionid;
        });
      }

      if(this.mode=='practicing' && question.correct==true){
        question.practice_verified=false;
      }
    },
    //交卷
    openComirmHandinModal:function(){
      if(this.ontest){
        document.body.classList.add("modal-open");
        vm3.show_comfirm_handin_modal=true;
      }
    },
    handin:function(){
      this.member.use_time=this.exam.limit_time*60*1000 - this.time_remaining;
      this.stop_timer=true;
      this.time_remaining=0;
      this.ontest=false;
      this.verifyAnswer();
    },
    verifyAnswer:function(){
      this.questions.forEach((question)=>{
        var type=question.type;
        switch(type){
          case "tf":
          case "s":
            //計算考生作答對錯
            if(question.student_answer==question.answer){
              question.correct=true;
            }else if(question.student_answer==""){
              question.correct=undefined;
            }else{
              question.correct=false;
            }
            //計算選項對錯
            question.options.forEach((option)=>{
              if(option.optionid==question.answer){
                option.correct_option=true;
              }else{
                option.correct_option=false;
              }
            })
          break;

          case "m":
            var isEmpty=question.student_answer.every((item)=>{
              return item=="";
            });
            var ans=question.answer.sort().toString();
            var sans=question.student_answer.sort().toString();
            if(ans==sans){
              question.correct=true;
            }else if(isEmpty){
              question.correct=undefined;
            }else{
              question.correct=false;
            }

            question.options.forEach((option)=>{
              if(question.answer.indexOf(option.optionid)>=0){
                option.correct_option=true;
              }else{
                option.correct_option=false;
              }
            })
          break;

          case "mi":
          case "sr":
            var isEmpty=question.student_answer.every((item)=>{
              return item=="";
            });
            if(question.student_answer.toString()==question.answer.toString()){
              question.correct=true;
            }else if(isEmpty){
              question.correct=undefined;
            }else{
              question.correct=false;
            }

            question.correct_option=[];
            question.answer.forEach((item,index)=>{
              if(item==question.student_answer[index]){
                question.correct_option[index]=true;
              }else{
                question.correct_option[index]=false;
              }
            })
          break;

          case "fb":
            var fb_answer=question.answer.map((item)=>{
              return decodeURIComponent(atob(item));
            });
            var isEmpty=question.student_answer.every((item)=>{
              return item=="";
            });
            if(question.student_answer.toString()==fb_answer.toString()){
              question.correct=true;
            }else if(isEmpty){
              question.correct=undefined;
            }else{
              question.correct=false;
            }

            question.fill_in_correct=[];
            question.answer.forEach((item,index)=>{
              var answer_decode=decodeURIComponent( atob(item) );
              if(answer_decode==question.student_answer[index]){
                question.fill_in_correct[index]=true;
              }else{
                question.fill_in_correct[index]=false;
              }
            })
          break;

        }
      })
    },
    countDown:function(){
      if(this.mode=='practicing'){
        setTimeout(()=>{
          this.$forceUpdate();
        })
      }else{
        var time=this.exam.limit_time*60*1000;
        this.time_remaining=time;
        var countdown=setInterval(()=>{
          if(this.stop_timer==true){
            clearInterval(countdown);
          }else{
            this.time_remaining=this.time_remaining-1000;
            if(this.time_remaining<=0){
              clearInterval(countdown);
              this.handin();
            }
          }
        },1000);
      }
    },
    openScoreModal:function(){
      if(!this.ontest){
        vm4.openModal();
      }
    },
    //螢幕大小判定
    screenWidth:function(){
      this.screen_width=window.innerWidth;
      window.onresize = () => {
        this.screen_width=window.innerWidth;
      };
    },
    //小螢幕時顯示 題目總覽
    showQuestionNav:function(){
      this.isOpenQnav=true;
    },
    hideQuestionNav:function(){
      this.isOpenQnav=false;
    },
    //錯誤回報
    openFeedbackModal:function(question){
      document.body.classList.add("modal-open");
      vm2.show_feedback_modal=true;
      vm2.show_answer=this.show_answer;
      vm2.member=this.member;

      vm2.question=JSON.parse(JSON.stringify(question));

      vm2.question.question={description:question.question,checked:false};
      vm2.question.options={description:question.options,checked:false};
      vm2.question.exp={description:question.exp,checked:false};
      vm2.question.answer={description:question.answer,checked:false};
      if(question.type=='mi'){
        vm2.question.ordering_options={description:question.ordering_options,checked:false};
      }
    },
    //排序題高度
    orderHeight:function(question){
      question.options.forEach((item,index)=>{
        var ref=question.id + item.optionid;
        var height=this.$refs[ref][0].clientHeight;
        item.height=height +'px';
      })
    },
    //配合題高度
    equalHeight:function(question){
      var arr=[];
      question.options.forEach((item,index)=>{
        var arr_item={leftside:0,rightside:0};
        arr[index]=arr_item;
        var ref=question.id + item.optionid;
        var height=this.$refs[ref][0].clientHeight;
        arr[index].leftside=height;
      });
      question.ordering_options.forEach((item,index)=>{
        var ref=question.id + item.optionid;
        var height=this.$refs[ref][0].clientHeight;
        arr[index].rightside=height;
      });
      var max_height = arr.map((item)=>{
        return Math.max(item.rightside,item.leftside)+'px';
      });
      for(i=0;i<max_height.length;i++){
        question.options[i].height=max_height[i];
        question.ordering_options[i].height=max_height[i];
      }
    },
    //錯誤重測
    reDo:function(){
      var all_right=this.questions.every((question)=>{
        return question.correct==true;
      });
      if(all_right){
        vm5.show_modal=true;
      }else{
        this.ontest=true;
        this.questions=this.questions.filter((question)=>{
          var type=question.type;
          if(type=='tf' || type=='s'){
            question.student_answer="";
          }else if(type=='m' || type=='mi' || type=='sr' || type=='fb'){
            question.student_answer=[];
          }
          return question.correct!=true;
        });
        this.tf=[];
        this.s=[];
        this.m=[];
        this.mi=[];
        this.sr=[];
        this.fb=[];
        this.filterQuestionType();

        this.stop_timer=false;
        this.countDown();

        window.scroll(0,0);
      }
    },
    // for delp
    initCollapse:function(){
      for(i=0;i<this.proficiency[this.target.main].chapters.length;i++){
        var item={
          show:true,
          height: 'auto',
        };
        this.mycollapse.push(item);
      }
    },
    toggleCollapse:function(index){
      var h=vm4.$refs['mycollapse'+index][0].clientHeight;
      var that=this.mycollapse[index];
      that.height=h+'px';
      if(that.show){
        setTimeout(function(){
          that.height='0px';
          that.show=false;
        },0);
      }else{
        that.show=true;
      }
    },
    // 作答: 選擇/是非
    studentAnswered:function(question){
      if(this.mode=='practicing'){
        var type=question.type;
        switch(type){

          case "tf":
          case "s":
            //計算考生作答對錯
            if(question.student_answer==question.answer){
              question.correct=true;
            }else if(question.student_answer==""){
              question.correct=undefined;
            }else{
              question.correct=false;
            }


            //計算選項對錯
            question.options.forEach((option)=>{
              if(option.optionid==question.answer){
                option.correct_option=true;
              }else{
                option.correct_option=false;
              }
            })
            if(question.correct==true){
              this.scrollToNext(question);
              this.scrollToNextNav(question);
            }else{
              question.practice_answer=true;
              setTimeout(()=>{
                this.resetQuestion(question);
              },350)
            }
          break;

          case "m":
            var isEmpty=question.student_answer.every((item)=>{
              return item=="";
            });
            var ans=question.answer.sort().toString();
            var sans=question.student_answer.sort().toString();
            if(ans==sans){
              question.correct=true;
            }else if(isEmpty){
              question.correct=undefined;
            }else{
              question.correct=false;
            }

            question.options.forEach((option)=>{
              if(question.answer.indexOf(option.optionid)>=0){
                option.correct_option=true;
              }else{
                option.correct_option=false;
              }
            });

            question.pratice_verified=true;
            if(question.correct==true){
              this.scrollToNext(question);
              this.scrollToNextNav(question);
            }else{
              question.practice_answer=true;
              setTimeout(()=>{
                question.pratice_verified=false;
                this.resetQuestion(question);
              },350)

            }
          break;

          case "mi":
          case "sr":
            var isEmpty=question.student_answer.every((item)=>{
              return item=="";
            });
            if(question.student_answer.toString()==question.answer.toString()){
              question.correct=true;
            }else if(isEmpty){
              question.correct=undefined;
            }else{
              question.correct=false;
            }

            question.correct_option=[];
            question.answer.forEach((item,index)=>{
              if(item==question.student_answer[index]){
                question.correct_option[index]=true;
              }else{
                question.correct_option[index]=false;
              }
            });
            this.$set(question, 'practice_verified', true);
            if(question.correct==true){
              this.scrollToNext(question);
              this.scrollToNextNav(question);
            }else{
              question.practice_answer=true;
              setTimeout(()=>{
                question.practice_verified=false;
                this.resetQuestion(question);
              },350)

            }

          break;

          case "fb":
            var fb_answer=question.answer.map((item)=>{
              return decodeURIComponent(atob(item));
            });
            var isEmpty=question.student_answer.every((item)=>{
              return item=="";
            });
            if(question.student_answer.toString()==fb_answer.toString()){
              question.correct=true;
            }else if(isEmpty){
              question.correct=undefined;
            }else{
              question.correct=false;
            }
            question.fill_in_correct=[];
            question.answer.forEach((item,index)=>{
              var answer_decode=decodeURIComponent( atob(item) );
              if(answer_decode==question.student_answer[index]){
                question.fill_in_correct[index]=true;
              }else{
                question.fill_in_correct[index]=false;
              }
            });
            this.$set(question, 'practice_verified', true);
            if(question.correct==true){
              this.scrollToNext(question);
              this.scrollToNextNav(question);
            }else{
              this.$set(question, 'practice_answer', true)

            }
          break;

        }

      }else{
        this.scrollToNext(question);
        this.scrollToNextNav(question);
      }
    },
  }
});

var vm2=new Vue({
  el:"#feedbackModal",
  data:{
    show_feedback_modal:false,
    member:{},
    question:{
      question:{description:'',checked:''},
      options:{description:[],checked:''},
      exp:{description:'',checked:''},
      content:'',
      answer:'',
    },
    show_answer:'',
  },
  methods:{
    closeFeedbackModal:function(){
      document.body.classList.remove("modal-open");
      this.show_feedback_modal=false;
    },
    sendFeedback:function(){
      //刪除非必要屬性
      var data=this.question;
      delete data.isRemarked;
      delete data.correct;
      delete data.correct_option;
      delete data.student_answer;
      console.log(data);
      //Ajax回傳後端
    }
  },
});

var vm3=new Vue({
  el:"#comfirmHandinModal",
  data:{
    show_comfirm_handin_modal:false,
  },
  methods:{
    closeModal:function(){
      document.body.classList.remove("modal-open");
      this.show_comfirm_handin_modal=false;
    },
    comfirmHandin:function(){
      if(vm.mode=="DEPL"){
        vm.initCollapse();
      }
      vm.handin();
      this.show_comfirm_handin_modal=false;
      vm4.show_modal=true;
    }
  },
});

var vm4=new Vue({
  el:"#scoreModal",
  data:{
    show_modal:false,
    first_show_modal:true,
    show_score:false,
    score:70,

    //animation
    startAnimation:false,
    text1:{opacity:0,top:'-80px'},
    text2:{opacity:0},
    show_stamp:false,
  },
  computed:{
    score_format:function(){
      return String(this.score).split('');
    },
  },
  created() {
    // initial Collapse

  },
  watch:{
    show_modal:function(){
      if(this.show_modal && this.first_show_modal){
        //先顯示姓名與使用時間
        setTimeout(()=>{
          this.text1.opacity=1;
          this.text1.top='0px';
          this.show_score=true;
        })
        //顯示分數
        setTimeout(()=>{
          this.startAnimation=true;
        },1000)
        //通過與否搓章
        setTimeout(()=>{
          this.show_stamp=true;
        },2800)
        //顯示及格分數 滿分
        setTimeout(()=>{
          this.text2.opacity=1;
        },2900)
        setTimeout(()=>{
          this.first_show_modal=false;
        },3300);
      }
    }
  },
  methods:{
    closeModal:function(){
      if(!this.first_show_modal){
        document.body.classList.remove("modal-open");
        this.show_modal=false;
      }
    },
    openModal:function(){
      this.show_modal=true;
      document.body.classList.add("modal-open");
    },
  }
});

var vm5=new Vue({
  el:"#allRight",
  data:{
    show_modal:false,
  },
  methods:{
    closeModal:function(){
      document.body.classList.remove("modal-open");
      this.show_modal=false;
    },
  },
});
