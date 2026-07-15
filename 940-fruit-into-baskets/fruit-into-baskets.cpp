class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        int n = fruits.size();
        unordered_map<int, int> count;
        int lp =0, rp =0 ,maxlen=0;
        for(int rp=0;rp<n;rp++){
            count[fruits[rp]]++;

            while (count.size()>2){
                count[fruits[lp]]--;
                if (count[fruits[lp]]==0){
                    count.erase(fruits[lp]);
                }
                lp++;
            }
            maxlen=max(maxlen,rp-lp+1);
        }
        return maxlen;
    }
};