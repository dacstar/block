var explorerTxListView = Vue.component('ExplorerTxListView', {
    template: `
        <div>
            <v-nav></v-nav>
            <v-breadcrumb title="Transaction Explorer" description="블록체인에서 생성된 거래내역을 보여줍니다."></v-breadcrumb>
            <div class="container">
                <explorer-nav></explorer-nav>
                <div class="row" v-if="transactions.length == 0">
                <div class="col-md-8 mx-auto" style="height: 400px;" v-if="load === true">
                <div class="semipolar-spinner" :style="spinnerStyle" style="margin:100px auto;">
                    <div class="ring"></div>
                    <div class="ring"></div>
                    <div class="ring"></div>
                    <div class="ring"></div>
                    <div class="ring"></div>
                </div>
            </div>
                </div>
                <div class="row">
                    <div id="transactions" class="col-md-8 mx-auto">
                        <div class="card shadow-sm" v-if="load === false">
                            <div class="card-header">Transactions</div>
                            <div class="card-body">
    
                                <div class="row tx-info" v-for="item in transactions">
                                    <div class="col-md-2">Tx</div>
                                    <div class="col-md-4">
                                        <router-link :to="{name: 'explorer.tx.detail', params: { hash: item.hash }}" class="tx-number">{{ item.hash | truncate(10) }}</router-link>
                                        <p class="tx-timestamp">{{ item.timeSince }}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><label class="text-secondary">From</label> {{ item.from | truncate(10) }}</p>
                                        <p><label class="text-secondary">To</label> {{ item.to | truncate(10) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data(){
        return {
            lastReadBlock : 0,
            transactions: [],
            block: {},
            load:true,
        };
    },
    methods: {
        fetchTxes: function(){
            /**
             * TODO 최근 블록에 포함된 트랜잭션 리스트를 반환합니다. 
             */
            var scope = this;
            scope.load=true;
            fetchLatestBlock().then(data =>{
                
               scope.lastReadBlock = data;
               // console.log(data);
               for(var i=scope.lastReadBlock-0, j=0;i>0&&j<1500;i--,j++){
                   getBlock(i).then(data=>{
                    
                       // console.log(data);
                       // console.log(data.hash);
                       // console.log("tx.length : "+ data.transactions.length);
                       for(var i=0;i<data.transactions.length;i++){
                           getTransactionFromBlock(data.hash, i).then(data1=>{
                            scope.load=false;
                               // console.log(data1);
                               data1.timestamp = timeSince(data.timestamp);
                               // console.log("tx : ");
                               scope.transactions.unshift(data1);
                           })
                       }
                   })
                   if(scope.transactions.length>9){
                       break;
                   }
               }
           })
        }
    },
    mounted: function(){
        this.fetchTxes();

        this.$nextTick(function () {
            window.setInterval(() => {
                this.fetchTxes();
            }, REFRESH_TIMES_OF_TRANSACTIONS);
        })
    }
})