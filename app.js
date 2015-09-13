
Vue.filter('dateFormat', function(value, formatString)
{
    if(formatString != undefined)
    {
        return moment(value).format(formatString);
    }
    return moment(value).format('DD/MM/YYYY');
});

new Vue({

    el: '#beerApp',

    data: {
        cervejarias: [],
        openDetails: [],
        sortColumn: 'name',
        sortInverse: false,
    },

    methods: {

        doSort: function(ev, column)
        {
            ev.preventDefault();

            var self = this;

            self.sortColumn = column;

            self.$set('sortInverse', !self.sortInverse);
        },

        doOpenDetails: function(ev, id)
        {
            ev.preventDefault();

            var self = this,

                index = self.openDetails.indexOf(id);

            if(index > -1)
            {
                self.openDetails.$remove(index);
            } else {
                self.openDetails.push(id);
            }
        },

        openAllDetails: function(ev)
        {
            ev.preventDefault();

            var self = this;

            if(self.openDetails.length > 0)
            {
                self.$set('openDetails', []);
            } else {
                self.$set('openDetails', _.pluck(self.cervejarias, 'id'));
            }
        }
    },

    ready: function()
    {
        var self = this;

        self.$http.get('http://api.beer.app/cervejarias', function(response)
        {
            self.$set('cervejarias', response);
        });
    }
});