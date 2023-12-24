
class whereClause {

    constructor(base, bigQ){
        this.base = base;
        this.bigQ = bigQ;
    }

    search(){

        const searchword = this.bigQ.search ? {
            $or: [
                {
                  firstname: {
                    $regex: this.bigQ.search,
                    $options: 'i',
                  },
                },
                {
                  lastname: {
                    $regex: this.bigQ.search,
                    $options: 'i',
                  },
                },
              ]
        } : {}; 

        this.base = this.base.find({...searchword}); 
        return this;
    }

    pager(resultPerPage){
        let currentPage = 1;

        if(this.bigQ.page){
            currentPage = this.bigQ.page;
        }

        // number of values we want to skip
        const skipVal = resultPerPage * (currentPage - 1);

        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    }

}

module.exports = whereClause;